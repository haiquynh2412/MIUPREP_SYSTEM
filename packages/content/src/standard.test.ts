import cpeSample1 from "./mocks/cpe-sample-1.json";
import listeningSample1 from "./mocks/listening-sample-1.json";
import readingSample1 from "./mocks/reading-sample-1.json";
import { createContentQueryService, getContentItemDetail, queryContentItems } from "./content-query";
import { buildEnglishContentGuardReport } from "./english-content-guard-report";
import { buildEnglishLearningCatalog, filterEnglishExamTestsToLearningReady, selectEnglishDiagnosticItems, selectEnglishPracticeItems } from "./english-learning";
import {
  MATH6_ACCESS_INDEX,
  MATH6_CHECKPOINTS,
  MATH6_LEARNING_MATRIX,
  buildMath6CoverageMatrix,
  getMath6PatternsByLevel,
  getMath6TopicById,
  getMath6TopicsByAxis,
} from "./math6-plan";
import { buildMath6QuestionItemsFromRawSources, extractMath6ExerciseBlocks, matchMath6TopicForSource } from "./math6-import";
import {
  buildSatLearningCatalog,
  buildSatContentReadinessSnapshot,
  selectSatDiagnosticItems,
  selectSatPracticeItems,
  toQuestionItemFromSatPublicQuestion,
  toQuestionItemsFromSatPublicPackage,
  type SatPublicQuestionItem,
  type SatPublicStudentPackage,
} from "./sat-content";
import { normalizeAdminEnglishExamImport, parseAdminEnglishExamImportJson } from "./admin-import";
import {
  getEnglishQuestionLearningReadinessIssues,
  isEnglishQuestionLearningReady,
  selectEnglishPilotQuestions,
  selectMiuMathPilotQuestions,
  toMockTestFromEnglishExam,
  toPassagesFromEnglishExam,
  toQuestionItemFromMiuMath,
  toQuestionItemsFromMiuMath,
  toQuestionItemsFromEnglishExam,
  type EnglishExamTest,
  type MiuMathQuestion,
} from "./standard";
import { auditEnglishExamTest, validateQuestionItem, validateStandardContentBundle } from "./validator";

declare function require(name: string): any;
declare const process: { cwd(): string };

const fs = require("node:fs");
const path = require("node:path");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEnglishCoreTagging(items: Array<{ domainId: string; conceptIds: string[]; skillIds: string[] }>, label: string) {
  assert(items.length > 0, `${label} should produce English Core practice items.`);
  assert(items.every((question) => question.domainId === "english_core"), `${label} items should stay in English Core.`);
  assert(items.every((question) => question.conceptIds.length > 0), `${label} items should map to at least one English concept.`);
  assert(items.every((question) => question.skillIds.length > 0), `${label} items should map to at least one English skill.`);
  assert(items.every((question) => question.conceptIds.every((conceptId) => conceptId.startsWith("eng."))), `${label} concepts should use the eng.* namespace.`);
  assert(items.every((question) => question.skillIds.every((skillId) => skillId.startsWith("eng."))), `${label} skills should use the eng.* namespace.`);
}

assert(MATH6_LEARNING_MATRIX.length >= 15, "Math 6 matrix should expose the full core plus advanced topic set.");
assert(MATH6_LEARNING_MATRIX.every((topic) => topic.grade === 6), "Every Math 6 matrix topic should be grade-scoped.");
assert(MATH6_LEARNING_MATRIX.every((topic) => topic.programIds.includes("vn_math_6")), "Every Math 6 topic should target the Grade 6 program.");
assert(MATH6_LEARNING_MATRIX.every((topic) => topic.sourceFiles.length > 0), "Every Math 6 topic should retain source file lineage.");
assert(MATH6_LEARNING_MATRIX.every((topic) => topic.patterns.length > 0), "Every Math 6 topic should define practice patterns.");
assert(MATH6_ACCESS_INDEX.grade["6"].length === MATH6_LEARNING_MATRIX.length, "Math 6 access index should expose every topic by grade.");
assert(getMath6TopicById("math6.number.divisibility")?.sourceFiles.some((file) => file.fileName.includes("Dấu hiệu chia hết")), "Divisibility topic should be grounded in the local source folder.");
assert(getMath6TopicsByAxis("semester", 1).some((topic) => topic.id === "math6.number.powers_order_operations"), "Semester access should include powers in semester 1.");
assert(getMath6TopicsByAxis("strand", "geometry").some((topic) => topic.id === "math6.geometry.angles"), "Strand access should include geometry angles.");
assert(getMath6TopicsByAxis("examTarget", "hsg").some((topic) => topic.id === "math6.advanced.sequence_patterns"), "Exam-target access should include HSG sequence patterns.");
assert(getMath6PatternsByLevel("hsg").length >= 5, "Math 6 HSG access should expose advanced practice patterns.");
assert(buildMath6CoverageMatrix().every((row) => row.sourceCount > 0 && row.patternCount > 0), "Math 6 coverage matrix should include sources and patterns per topic.");
assert(MATH6_CHECKPOINTS.some((checkpoint) => checkpoint.id === "math6.checkpoint.entry_diagnostic"), "Math 6 plan should include entry diagnostic checkpoint.");
assert(MATH6_CHECKPOINTS.some((checkpoint) => checkpoint.id === "math6.checkpoint.final_2"), "Math 6 plan should include final semester 2 checkpoint.");

const math6RawText = [
  "B/ Bài tập",
  "Bài 1: Viết tập hợp các chữ cái trong từ TOÁN HỌC.",
  "Bài 2: Viết tập hợp A các số tự nhiên nhỏ hơn 10 bằng hai cách.",
  "Bài 3: Tìm số phần tử của tập hợp B = {1; 2; ...; 99}.",
].join("\n");
const math6Blocks = extractMath6ExerciseBlocks(math6RawText);
assert(math6Blocks.length === 3, "Math 6 extractor should split exercise blocks by Bai/Cau headers.");
const math6TopicMatch = matchMath6TopicForSource({
  fileName: "Chuyên đề 1 tập hợp.doc",
  relativePath: "Chuyên đề 1 tập hợp.doc",
  text: math6RawText,
});
assert(math6TopicMatch?.topic.id === "math6.number.sets_natural_numbers", "Math 6 source matcher should map source lineage to the right topic.");
const math6Import = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Chuyên đề 1 tập hợp.doc",
    relativePath: "Chuyên đề 1 tập hợp.doc",
    path: "C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/TAI LIEU TOAN 6/Chuyên đề 1 tập hợp.doc",
    extension: "doc",
    text: math6RawText,
  },
]);
assert(math6Import.items.length === 3, "Math 6 importer should convert extracted blocks to QuestionItems.");
assert(math6Import.items.every((question) => question.programIds.includes("vn_math_6")), "Math 6 imported questions should target Grade 6.");
assert(math6Import.items.every((question) => question.metadata?.topicId === "math6.number.sets_natural_numbers"), "Math 6 imported questions should retain topic metadata.");
assert(validateStandardContentBundle({ questions: math6Import.items }).length === 0, "Math 6 imported QuestionItems should validate cleanly.");

const math6MixedReview = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "de-kiem-tra-hoc-ki-1-mon-toan-lop-6.doc",
    relativePath: "de-kiem-tra-hoc-ki-1-mon-toan-lop-6.doc",
    extension: "doc",
    text: [
      "Cau 1: Thuc hien phep tinh 24.66 + 33.24 + 24.",
      "Cau 2: Tim UCLN cua 24 va 36.",
      "Cau 3: Cho goc xOy va tia phan giac Ot. Tinh so do goc.",
    ].join("\n"),
  },
]);
assert(math6MixedReview.items.length === 3, "Math 6 mixed review files should be classified block by block.");
assert(math6MixedReview.items.some((question) => question.metadata?.topicId === "math6.number.natural_operations"), "Mixed review arithmetic blocks should map to natural operations.");
assert(math6MixedReview.items.some((question) => question.metadata?.topicId === "math6.number.prime_factor_gcd_lcm"), "Mixed review UCLN blocks should map to GCD/LCM.");
assert(math6MixedReview.items.some((question) => question.metadata?.topicId === "math6.geometry.angles"), "Mixed review angle blocks should map to angles.");
assert(validateStandardContentBundle({ questions: math6MixedReview.items }).length === 0, "Math 6 mixed review QuestionItems should validate cleanly.");

const baseQuestion: MiuMathQuestion = {
  id: "Q001",
  exam_id: 1,
  exam_name: "Pilot 01",
  type: "multiple_choice",
  difficulty: "hard",
  category: "equations-systems",
  category_vn: "Phuong trinh",
  question_text: "Solve x + 1 = 2",
  options: [
    { key: "A", content: "1" },
    { key: "B", content: "2" },
  ],
  correct_answer: "A",
  explanation: { thinking: "Subtract 1.", steps: "x = 1" },
  sub_category: "eqsys-quadratic-core",
  sub_category_vn: "Quadratic core",
};

const item = toQuestionItemFromMiuMath(baseQuestion);
assert(item.id === "miumath.Q001", "Adapter should preserve the MiuMath source id with namespace.");
assert(item.domainId === "mathematics", "MiuMath questions should be mapped to mathematics.");
assert(item.programIds.includes("vn_math_6_9"), "MiuMath pilot should target VN math 6-9.");
assert(item.programIds.includes("vn_math_9"), "MiuMath items should target the Grade 9 program.");
assert(item.programIds.includes("vn_math_vao_10"), "MiuMath items should target the entrance-exam program.");
assert(item.programIds.includes("vn_math_thcs"), "MiuMath items should target the integrated THCS program.");
assert(item.conceptIds.includes("math.quadratic_equation"), "Subcategory override should map quadratic concept.");
assert(item.skillIds.includes("math.solve_quadratic_by_factor"), "Subcategory override should map quadratic skill.");
assert(item.metadata?.grade === 9, "MiuMath taxonomy should expose a grade.");
assert(item.metadata?.topicId === "math.quadratic_equation", "MiuMath taxonomy should expose a topic id.");
assert(item.metadata?.patternId === "math9.equation.quadratic_core", "MiuMath taxonomy should expose a pattern id.");
assert(item.metadata?.level === "core", "MiuMath taxonomy should expose a learning level.");
assert(item.difficulty === "hard", "Known difficulty should be preserved.");
assert(validateQuestionItem(item).length === 0, "Adapted MiuMath QuestionItem should validate cleanly.");

const fallbackItem = toQuestionItemFromMiuMath({
  ...baseQuestion,
  id: "Q002",
  category: "future-topic",
  sub_category: "future-subtopic",
});
assert(fallbackItem.conceptIds.includes("math.untagged"), "Unknown future categories should be accepted as untagged.");
assert(fallbackItem.skillIds.includes("math.untagged"), "Unknown future skills should be accepted as untagged.");

const miumathQuestions = loadMiuMathQuestions();
const miumathItems = toQuestionItemsFromMiuMath(miumathQuestions);
assert(miumathItems.length === 485, "Current MiuMath bank should expose 485 adapted items.");
assert(miumathItems.every((question) => question.programIds.includes("vn_math_9")), "All current MiuMath items should map to Grade 9.");
assert(miumathItems.every((question) => question.programIds.includes("vn_math_vao_10")), "All current MiuMath items should map to entrance-exam review.");
assert(miumathItems.every((question) => question.programIds.includes("vn_math_thcs")), "All current MiuMath items should map to the integrated THCS program.");
assert(miumathItems.every((question) => question.metadata?.topicId), "All current MiuMath items should expose topic ids.");
assert(miumathItems.every((question) => question.metadata?.patternId), "All current MiuMath items should expose pattern ids.");
assert(miumathItems.every((question) => question.metadata?.level), "All current MiuMath items should expose learning levels.");
assert(!miumathItems.some((question) => question.conceptIds.includes("math.untagged")), "Known MiuMath categories should not fall back to untagged concepts.");
assert(!miumathItems.some((question) => question.skillIds.includes("math.untagged")), "Known MiuMath categories should not fall back to untagged skills.");
assert(validateStandardContentBundle({ questions: miumathItems }).length === 0, "Full MiuMath bank should validate as standard QuestionItems.");

const pilot = selectMiuMathPilotQuestions(
  [
    baseQuestion,
    { ...baseQuestion, id: "Q003", category: "statistics", sub_category: "stats-charts", difficulty: "medium" },
    { ...baseQuestion, id: "Q004", category: "probability", sub_category: "prob-simple", difficulty: "easy" },
  ],
  2,
);
assert(pilot.length === 2, "Pilot selector should honor the requested limit.");
assert(new Set(pilot.map((question) => question.id)).size === 2, "Pilot selector should not duplicate questions.");

const satMathSample: SatPublicQuestionItem = {
  id: "sat-sample-math-system",
  section: "Math",
  domain: "Algebra",
  skill: "Systems of two linear equations in two variables",
  difficulty: "Medium",
  questionType: "multiple_choice",
  prompt: "A theater sells adult tickets for $12 and child tickets for $8. The theater sold 150 tickets for $1,520. How many adult tickets were sold?",
  choices: { A: "60", B: "80", C: "70", D: "90" },
  correctAnswer: "B",
  explanation: { correct: "Solve the system a + c = 150 and 12a + 8c = 1520." },
  modulePlacement: "module1",
  estimatedTimeSeconds: 95,
};

const satMathItem = toQuestionItemFromSatPublicQuestion(satMathSample, "test");
assert(satMathItem.id === "sat.sat-sample-math-system", "SAT adapter should namespace public ids.");
assert(satMathItem.domainId === "mathematics", "SAT Math should map to Mathematics.");
assert(satMathItem.programIds.includes("sat"), "SAT item should keep SAT program id.");
assert(satMathItem.conceptIds.includes("math.linear_equation"), "SAT Algebra should map to linear equation concepts.");
assert(satMathItem.skillIds.includes("math.solve_system"), "SAT systems skill should map to system solving.");
assert(satMathItem.choices?.length === 4, "SAT MCQ choices should convert from keyed choice object.");
assert(validateQuestionItem(satMathItem).length === 0, "Adapted SAT Math QuestionItem should validate cleanly.");

const satRwSample: SatPublicQuestionItem = {
  id: "sat-sample-rw-transitions",
  section: "Reading and Writing",
  domain: "Expression of Ideas",
  skill: "Transitions",
  difficulty: "Hard",
  questionType: "multiple_choice",
  prompt: "Which choice completes the text with the most logical transition?",
  choices: { A: "However", B: "For example", C: "Therefore", D: "Similarly" },
  correctAnswer: "C",
  explanation: "The transition should show a result.",
};

const satRwItem = toQuestionItemFromSatPublicQuestion(satRwSample, "test");
assert(satRwItem.domainId === "english_core", "SAT Reading and Writing should map to English Core.");
assert(satRwItem.conceptIds.includes("eng.cohesion_reference"), "SAT transitions should map to cohesion/reference.");
assert(satRwItem.skillIds.includes("eng.track_cohesive_reference"), "SAT transitions should map to cohesive tracking.");
assert(validateQuestionItem(satRwItem).length === 0, "Adapted SAT RW QuestionItem should validate cleanly.");

const satPublicPackage = loadSatPublicPackage();
const satSnapshot = buildSatContentReadinessSnapshot(satPublicPackage, "2026-06-03T00:00:00.000Z");
assert(satSnapshot.totalItems === satPublicPackage.items.length, "SAT snapshot should count every public package item.");
assert(satSnapshot.totalItems >= 9000, "SAT public package should expose the current large student bank.");
assert(satSnapshot.uniqueIds === satSnapshot.totalItems, "SAT public package should not contain duplicate ids.");
assert(satSnapshot.adapter.pass, "SAT public package should adapt to QuestionItem without validation errors.");
assert(satSnapshot.blockerItems === 0, "SAT public package should have no blocker items.");
assert(satSnapshot.bySection.Math > 0, "SAT snapshot should include Math questions.");
assert(satSnapshot.bySection["Reading and Writing"] > 0, "SAT snapshot should include Reading and Writing questions.");

const satPublicItems = toQuestionItemsFromSatPublicPackage(satPublicPackage);
assert(satPublicItems.length === satSnapshot.totalItems, "SAT package adapter should convert every public question.");
assert(satPublicItems.some((question) => question.domainId === "mathematics"), "SAT adapted package should include math items.");
assert(satPublicItems.some((question) => question.domainId === "english_core"), "SAT adapted package should include English Core items.");
assert(new Set(satPublicItems.map((question) => question.id)).size === satPublicItems.length, "SAT adapted ids should be unique.");
assert(validateStandardContentBundle({ questions: satPublicItems }).length === 0, "Full SAT public package should validate as standard QuestionItems.");

const satCatalog = buildSatLearningCatalog(satPublicPackage);
assert(satCatalog.items.length === satPublicPackage.items.length, "SAT learning catalog should expose every adapted public item.");
assert(satCatalog.coverage.bySection.Math > 0, "SAT learning catalog should track Math coverage.");
assert(satCatalog.coverage.bySection["Reading and Writing"] > 0, "SAT learning catalog should track RW coverage.");

const satDiagnosticItems = selectSatDiagnosticItems(satCatalog, [], { limit: 44 });
assert(satDiagnosticItems.length === 44, "SAT diagnostic selector should honor the default Bluebook-sized limit.");
assert(satDiagnosticItems.some((question) => question.domainId === "mathematics"), "SAT diagnostic should include Math when unscoped.");
assert(satDiagnosticItems.some((question) => question.domainId === "english_core"), "SAT diagnostic should include Reading and Writing when unscoped.");
assert(new Set(satDiagnosticItems.map((question) => question.id)).size === satDiagnosticItems.length, "SAT diagnostic should not duplicate items.");

const satAlgebraPractice = selectSatPracticeItems(satCatalog, {
  limit: 12,
  section: "Math",
  domain: "Algebra",
  skillIds: ["math.solve_linear_equation"],
  attemptedItemIds: satDiagnosticItems.map((question) => question.id),
});
assert(satAlgebraPractice.length > 0, "SAT practice selector should return scoped Algebra practice.");
assert(satAlgebraPractice.every((question) => question.domainId === "mathematics"), "SAT Algebra practice should stay in Mathematics.");
assert(satAlgebraPractice.every((question) => question.skillIds.includes("math.solve_linear_equation")), "SAT practice selector should respect skill filters.");
assert(satAlgebraPractice.every((question) => !satDiagnosticItems.some((diagnostic) => diagnostic.id === question.id)), "SAT practice selector should skip attempted diagnostic items.");

const satHardMathPractice = selectSatPracticeItems(satCatalog, {
  limit: 8,
  section: "Math",
  difficulty: "Hard",
});
assert(satHardMathPractice.length > 0, "SAT practice selector should return difficulty-scoped Math practice.");
assert(satHardMathPractice.every((question) => question.difficulty === "hard"), "SAT practice selector should respect difficulty filters.");

const satMathQueryPage1 = queryContentItems(satCatalog.items, {
  programId: "sat",
  domainId: "mathematics",
  difficulty: "hard",
  mode: "practice",
  limit: 5,
});
assert(satMathQueryPage1.items.length === 5, "Content query should return only the requested SAT page size.");
assert(satMathQueryPage1.total > satMathQueryPage1.items.length, "Content query should expose total matches without returning the full SAT bank.");
assert(Boolean(satMathQueryPage1.nextCursor), "Content query should provide a cursor when more SAT items exist.");
assert(!("correctAnswer" in satMathQueryPage1.items[0]), "Content summaries should not expose answer keys.");
assert(!("prompt" in satMathQueryPage1.items[0]), "Content summaries should not expose full prompts.");
assert(satMathQueryPage1.items.every((question) => question.domainId === "mathematics"), "Content query should respect domain filters.");
assert(satMathQueryPage1.items.every((question) => question.difficulty === "hard"), "Content query should respect difficulty filters.");

const satMathQueryPage2 = queryContentItems(satCatalog.items, {
  programId: "sat",
  domainId: "mathematics",
  difficulty: "hard",
  mode: "practice",
  limit: 5,
  cursor: satMathQueryPage1.nextCursor,
});
assert(satMathQueryPage2.items.length === 5, "Content query should page forward from a cursor.");
assert(satMathQueryPage2.total === satMathQueryPage1.total, "Content query total should stay stable across cursor pages.");
assert(!satMathQueryPage2.items.some((item) => satMathQueryPage1.items.some((existing) => existing.id === item.id)), "Cursor pages should not overlap.");
const satMathQueryRepeat = queryContentItems(satCatalog.items, {
  programId: "sat",
  domainId: "mathematics",
  difficulty: "hard",
  mode: "practice",
  limit: 5,
});
assert(satMathQueryRepeat.items.map((item) => item.id).join(",") === satMathQueryPage1.items.map((item) => item.id).join(","), "Content query order should be deterministic.");
const satDetail = getContentItemDetail(satCatalog.items, satMathQueryPage1.items[0].id);
assert(Boolean(satDetail?.prompt), "Content detail lookup should fetch full item detail only by id.");
assert(satDetail?.correctAnswer !== undefined, "Content detail lookup should keep answer key out of summaries but available to trusted callers.");
const satQueryService = createContentQueryService(satCatalog.items, { maxCacheEntries: 2, defaultLimit: 4, maxLimit: 10 });
const cachedSatQuery = satQueryService.query({ programId: "sat", domainId: "mathematics", mode: "practice" });
const cachedSatQueryRepeat = satQueryService.query({ programId: "sat", domainId: "mathematics", mode: "practice" });
assert(cachedSatQuery.items.length === 4, "Content query service should honor default page limits.");
assert(cachedSatQuery.items.map((item) => item.id).join(",") === cachedSatQueryRepeat.items.map((item) => item.id).join(","), "Content query service cache should preserve deterministic results.");
assert(satQueryService.getDetail(cachedSatQuery.items[0].id)?.id === cachedSatQuery.items[0].id, "Content query service should fetch item detail by id.");

const ieltsReading = { ...(readingSample1 as unknown as EnglishExamTest), exam: "ielts" };
const ieltsListening = { ...(listeningSample1 as unknown as EnglishExamTest), exam: "ielts" };
const ieltsWriting = { ...(readingSample1 as unknown as EnglishExamTest), id: "ielts-writing-smoke", exam: "ielts", skill: "writing" };
const cpeReading = { ...(cpeSample1 as unknown as EnglishExamTest), exam: "cpe" };
const cpeSpeaking = { ...(readingSample1 as unknown as EnglishExamTest), id: "cpe-speaking-smoke", exam: "cpe", skill: "speaking" };

const readingItems = toQuestionItemsFromEnglishExam(ieltsReading);
assert(readingItems.length > 0, "IELTS reading sample should produce question items.");
assertEnglishCoreTagging(readingItems, "IELTS reading");
assert(readingItems.every((question) => question.domainId === "english_core"), "IELTS items should map to English Core.");
assert(readingItems.every((question) => question.programIds.includes("ielts")), "IELTS items should keep IELTS program id.");
assert(readingItems.some((question) => question.conceptIds.includes("eng.reading_inference")), "Reading items should map to reading inference.");
assert(readingItems.every((question) => question.masteryPolicy === "tracked"), "Reading items should remain mastery-tracked.");

const listeningItems = toQuestionItemsFromEnglishExam(ieltsListening);
assertEnglishCoreTagging(listeningItems, "IELTS listening");
assert(listeningItems.some((question) => question.conceptIds.includes("eng.listening_detail")), "Listening items should map to listening detail.");
assert(listeningItems.some((question) => question.skillIds.includes("eng.identify_specific_detail")), "Listening items should map to detail skill.");
assert(listeningItems.some((question) => question.conceptIds.includes("eng.listening_main_idea")), "Listening items should map to listening core.");

const cpeItems = toQuestionItemsFromEnglishExam(cpeReading);
assert(cpeItems.length > 0, "CPE sample should produce question items.");
assertEnglishCoreTagging(cpeItems, "CPE reading/use of English");
assert(cpeItems.every((question) => question.programIds.includes("cpe")), "CPE items should keep CPE program id.");
assert(cpeItems.some((question) => question.conceptIds.includes("eng.grammar_accuracy")), "CPE cloze items should map to grammar accuracy.");
assert(cpeItems.some((question) => question.conceptIds.includes("eng.vocabulary_range")), "CPE cloze items should map to vocabulary range.");

const cpeKeyWordTransformation = {
  id: "cpe-kwt-smoke",
  title: "CPE Reading and Use of English Smoke",
  exam: "cpe",
  skill: "reading",
  sections: [
    {
      id: "cpe-kwt-sec",
      title: "Part 4: Key Word Transformation",
      instructions: "Complete the second sentence so that it has a similar meaning.",
      passageHtml: "",
      questionGroups: [
        {
          id: "cpe-kwt-group",
          instruction: "Use the word given in capitals.",
          questions: [
            {
              id: "cpe-kwt-q1",
              type: "gap_fill",
              instruction: "The result was not what we expected. TURNED",
              blankIndex: 1,
              acceptedAnswers: [["turned out to be"]],
              correctAnswer: "turned out to be",
              explanation: "Key word transformation tests controlled grammar and lexical range, not source-passage reading.",
              answerLocation: "turned out to be",
              category: "cpe_part_4",
              displayMode: "both",
            },
          ],
        },
      ],
    },
  ],
} satisfies EnglishExamTest;
const cpeKwtQuestion = cpeKeyWordTransformation.sections[0].questionGroups[0].questions[0];
const cpeKwtIssues = getEnglishQuestionLearningReadinessIssues(
  cpeKeyWordTransformation,
  cpeKeyWordTransformation.sections[0],
  cpeKeyWordTransformation.sections[0].questionGroups[0],
  cpeKwtQuestion,
);
assert(!cpeKwtIssues.some((issue) => issue.code === "missing_reading_content"), "CPE Part 4 should be treated as Use of English, not blocked for missing reading passage.");
assert(isEnglishQuestionLearningReady(cpeKeyWordTransformation, cpeKeyWordTransformation.sections[0], cpeKeyWordTransformation.sections[0].questionGroups[0], cpeKwtQuestion), "CPE key word transformation should be learning-ready without passageHtml.");

const cpeListeningTopicPractice = {
  id: "cpe-listening-topic-smoke",
  title: "CPE Listening Topic Bank Smoke",
  exam: "cpe",
  skill: "listening",
  sections: [
    {
      id: "cpe-listening-topic-sec",
      title: "Listening Part 1: Topic Practice",
      instructions: "Use these items for question-form practice before official audio is attached.",
      questionGroups: [
        {
          id: "cpe-listening-topic-group",
          instruction: "Choose the best option.",
          questions: [
            {
              id: "cpe-listening-topic-q1",
              type: "multiple_choice",
              instruction: "What is the speaker's attitude?",
              options: ["A. doubtful", "B. enthusiastic", "C. indifferent"],
              acceptedAnswers: [["B"]],
              correctAnswer: "B",
              explanation: "This topic item carries answer-key review and distractor analysis while audio is pending.",
              answerLocation: "B",
              passageHtml: "<p>Audio is not bundled in this topic bank yet.</p>",
              category: "cpe_listen_part_1",
              displayMode: "topic",
            },
          ],
        },
      ],
    },
  ],
} satisfies EnglishExamTest;
const cpeListeningTopicQuestion = cpeListeningTopicPractice.sections[0].questionGroups[0].questions[0];
const cpeListeningTopicIssues = getEnglishQuestionLearningReadinessIssues(
  cpeListeningTopicPractice,
  cpeListeningTopicPractice.sections[0],
  cpeListeningTopicPractice.sections[0].questionGroups[0],
  cpeListeningTopicQuestion,
);
assert(!cpeListeningTopicIssues.some((issue) => issue.code === "missing_listening_content"), "CPE topic-mode listening practice should not be blocked when it has study content and answer review.");
assert(isEnglishQuestionLearningReady(cpeListeningTopicPractice, cpeListeningTopicPractice.sections[0], cpeListeningTopicPractice.sections[0].questionGroups[0], cpeListeningTopicQuestion), "CPE topic-mode listening practice should be learning-ready before official audio is attached.");

const summaryOnlyAdminImport = parseAdminEnglishExamImportJson(
  JSON.stringify({
    id: "demo-cpe-summary",
    title: "Demo CPE Summary Import",
    exam: "CPE",
    duration: 60,
    questions: [
      { id: "q1", text: "Reading passage 1 question...", answer: "A" },
      { id: "q2", text: "Use of English sentence transformation...", answer: "B" },
    ],
  }),
  "cpe",
);
assert(summaryOnlyAdminImport.ok, "Admin import should accept lightweight summary-only CPE payloads.");
if (summaryOnlyAdminImport.ok) {
  assert(summaryOnlyAdminImport.exam.questions === 2, "Summary-only admin import should count root questions.");
  assert(summaryOnlyAdminImport.exam.standardStatus === "summary_only", "Summary-only admin import should not claim learning-ready conversion.");
  assert(!summaryOnlyAdminImport.adapter.attempted, "Summary-only admin import should skip standard adapter conversion.");
}

const fullCpeAdminImport = normalizeAdminEnglishExamImport(cpeReading, "cpe");
assert(fullCpeAdminImport.ok, "Admin import should accept full CPE mock test payloads.");
if (fullCpeAdminImport.ok) {
  assert(fullCpeAdminImport.exam.questions === cpeItems.length, "Full CPE admin import should count nested section questions.");
  assert(fullCpeAdminImport.exam.standardStatus === "learning_ready", "Full CPE admin import should validate as learning-ready.");
  assert(fullCpeAdminImport.adapter.attempted, "Full CPE admin import should run the standard adapter.");
  assert(fullCpeAdminImport.adapter.readyQuestions === cpeItems.length, "Full CPE admin import should expose ready QuestionItem count.");
  assert(fullCpeAdminImport.adapter.errors.length === 0, "Full CPE admin import should have no standard bundle errors.");
}

const mismatchedAdminImport = normalizeAdminEnglishExamImport({ ...cpeReading, exam: "ielts" }, "cpe");
assert(!mismatchedAdminImport.ok, "Admin import should reject a payload whose exam track does not match the active tab.");

const writingItems = toQuestionItemsFromEnglishExam(ieltsWriting);
assert(writingItems.length > 0, "IELTS writing sample should produce question items.");
assert(writingItems.every((question) => question.masteryPolicy === "feedback_only"), "Writing items should be feedback-only for now.");
assert(writingItems.every((question) => question.feedbackArea === "writing"), "Writing feedback area should be preserved.");
assert(writingItems.some((question) => question.conceptIds.includes("eng.writing_task_response")), "Writing items should map to task response.");
assert(writingItems.some((question) => question.skillIds.includes("eng.plan_essay_response")), "Writing items should map to essay planning.");

const speakingItems = toQuestionItemsFromEnglishExam(cpeSpeaking);
assert(speakingItems.length > 0, "CPE speaking sample should produce question items.");
assert(speakingItems.every((question) => question.masteryPolicy === "feedback_only"), "Speaking items should be feedback-only for now.");
assert(speakingItems.every((question) => question.feedbackArea === "speaking"), "Speaking feedback area should be preserved.");
assert(speakingItems.some((question) => question.conceptIds.includes("eng.interactive_communication")), "Speaking items should map to interaction.");
assert(speakingItems.some((question) => question.skillIds.includes("eng.organize_spoken_response")), "Speaking items should map to spoken response organization.");

const mockTest = toMockTestFromEnglishExam(cpeReading);
assert(mockTest.id === "cpe.cpe-sample-1", "Mock test id should be namespaced by program.");
assert(mockTest.questionIds.length === cpeItems.length, "Mock test should include every adapted CPE question id.");
assert(mockTest.sections?.length === cpeReading.sections.length, "Mock test should preserve section structure.");

const passages = toPassagesFromEnglishExam(ieltsReading);
assert(passages.length === ieltsReading.sections.length, "Reading passages should be emitted per section.");
assert(passages.every((passage) => passage.programIds.includes("ielts")), "Passages should keep program id.");

const standardBundleErrors = validateStandardContentBundle({
  questions: [...readingItems, ...listeningItems, ...cpeItems, ...writingItems, ...speakingItems],
  mockTests: [toMockTestFromEnglishExam(ieltsReading), toMockTestFromEnglishExam(ieltsListening), mockTest],
  passages: [...passages, ...toPassagesFromEnglishExam(ieltsListening), ...toPassagesFromEnglishExam(cpeReading)],
});
assert(standardBundleErrors.length === 0, `Adapted English content should validate cleanly: ${standardBundleErrors.map((error) => error.path).join(", ")}`);

const englishPilot = selectEnglishPilotQuestions([ieltsReading, ieltsListening, cpeReading], 12);
assert(englishPilot.length === 12, "English pilot selector should honor the requested limit.");
assert(new Set(englishPilot.map((question) => question.id)).size === englishPilot.length, "English pilot selector should not duplicate questions.");

const guardReport = buildEnglishContentGuardReport("2026-06-03T00:00:00.000Z");
const readingReadiness = guardReport.skillReadiness.find((row) => row.skill === "reading");
const writingReadiness = guardReport.skillReadiness.find((row) => row.skill === "writing");
const speakingReadiness = guardReport.skillReadiness.find((row) => row.skill === "speaking");
const listeningReadiness = guardReport.skillReadiness.find((row) => row.skill === "listening");
const useOfEnglishReadiness = guardReport.skillReadiness.find((row) => row.skill === "use_of_english");
assert(Boolean(writingReadiness?.feedbackOnlyItems), "English guard should include Writing feedback sample readiness.");
assert(Boolean(speakingReadiness?.feedbackOnlyItems), "English guard should include Speaking feedback sample readiness.");
assert(Boolean(listeningReadiness?.learningReadyItems), "English guard should include Listening learning-ready coverage.");
assert(Boolean(writingReadiness?.byProgram.cpe), "Writing readiness should include CPE samples.");
assert(Boolean(speakingReadiness?.byProgram.ielts), "Speaking readiness should include IELTS samples.");
assert(guardReport.coverage.byProgram.cae === 3829, "CAE import should expose all 3,829 learning-ready questions.");
assert(readingReadiness?.byProgram.cae === 1196, "CAE Reading questions should stay mapped to Reading.");
assert(listeningReadiness?.byProgram.cae === 613, "CAE Listening questions should stay mapped to Listening.");
assert(useOfEnglishReadiness?.byProgram.cae === 2020, "CAE Use of English questions should stay mapped to Use of English.");

const caeMockQuestions = loadCaeMockQuestions();
assert(caeMockQuestions.length === 3829, "CAE raw mock files should contain 3,829 questions.");
assert(caeMockQuestions.every((question) => question.topic?.program === "cae"), "Every CAE question should carry CAE topic metadata.");
assert(caeMockQuestions.every((question) => question.tags?.includes("english_core") && question.tags?.includes("cae")), "Every CAE question should be tagged for English Core and CAE.");
assert(caeMockQuestions.every((question) => question.topic?.id && question.tags?.includes(question.topic.id)), "Every CAE question tag list should include its topic id.");
assert(!caeMockQuestions.some((question) => question.topic?.skill === "reading" && question.tags?.includes("use_of_english")), "CAE Reading questions should not keep stale Use of English tags.");
assert(!caeMockQuestions.some((question) => question.topic?.skill === "listening" && question.tags?.includes("reading")), "CAE Listening questions should not keep stale Reading tags.");

const firstCpeSection = cpeReading.sections[0];
const firstCpeGroup = firstCpeSection.questionGroups[0];
const firstCpeQuestion = firstCpeGroup.questions[0];
const badCpe = {
  ...cpeReading,
  id: "bad-cpe-test",
  title: "Bad CPE Test",
  sections: [
    {
      ...firstCpeSection,
      title: "Part 5: Reading multiple choice",
      passageHtml: "",
      questionGroups: [
        {
          ...firstCpeGroup,
          questions: [
            {
              ...firstCpeQuestion,
              id: "bad-cpe-q1",
              instruction: "",
              options: [],
              acceptedAnswers: [],
              correctAnswer: null,
              explanation: "",
              answerLocation: "",
              category: "cpe_reading_part_5",
            },
          ],
        },
      ],
    },
  ],
} satisfies EnglishExamTest;

const badQuestionReady = isEnglishQuestionLearningReady(badCpe, badCpe.sections[0], badCpe.sections[0].questionGroups[0], badCpe.sections[0].questionGroups[0].questions[0]);
assert(!badQuestionReady, "Question with missing prompt/content/answer should not be learning-ready.");

const badIssues = auditEnglishExamTest(badCpe);
assert(badIssues.some((issue) => issue.severity === "blocker" && issue.code === "missing_instruction"), "Audit should catch missing question instruction.");
assert(badIssues.some((issue) => issue.severity === "blocker" && issue.code === "missing_answer_key"), "Audit should catch missing answer key.");
assert(badIssues.some((issue) => issue.severity === "blocker" && issue.code === "missing_reading_content"), "Audit should catch missing reading content.");

const gatedPilot = selectEnglishPilotQuestions([badCpe], 5);
assert(gatedPilot.length === 0, "English pilot selector should exclude non-learning-ready questions by default.");

const ungatedPilot = selectEnglishPilotQuestions([badCpe], 5, { learningReadyOnly: false });
assert(ungatedPilot.length === 1, "English pilot selector can include raw items when explicitly ungated for audit/debug.");

const englishCatalog = buildEnglishLearningCatalog([ieltsReading, ieltsListening, cpeReading]);
assert(englishCatalog.items.length > 0, "English learning catalog should expose ready learning items.");
assert(englishCatalog.coverage.readyQuestions === englishCatalog.items.length, "Catalog coverage should count ready questions.");
assert(englishCatalog.mockTests.every((test) => test.questionIds.length > 0), "Ready mock tests should not contain empty question lists.");
assert(englishCatalog.items.every((question) => question.domainId === "english_core"), "Catalog items should stay in English Core.");

const badCatalog = buildEnglishLearningCatalog([badCpe]);
assert(badCatalog.items.length === 0, "Catalog should exclude blocked CPE questions.");
assert(badCatalog.coverage.blockedQuestions === 1, "Catalog coverage should count blocked questions.");

const readyTests = filterEnglishExamTestsToLearningReady([ieltsReading, badCpe], { programIds: ["ielts", "cpe"] });
assert(readyTests.some((test) => test.id === ieltsReading.id), "Ready test filter should keep tests with learning-ready questions.");
assert(!readyTests.some((test) => test.id === badCpe.id), "Ready test filter should drop tests with no learning-ready questions.");
assert(readyTests.every((test) => test.sections.every((section) => section.questionGroups.every((group) => group.questions.length > 0))), "Ready test filter should remove empty groups and sections.");

const diagnosticItems = selectEnglishDiagnosticItems(englishCatalog, [], { limit: 6, programId: "cpe" });
assert(diagnosticItems.length === 6, "English diagnostic selector should honor the requested limit.");
assert(diagnosticItems.every((question) => question.programIds.includes("cpe")), "Program-scoped diagnostic should only use CPE items.");
assert(new Set(diagnosticItems.map((question) => question.id)).size === diagnosticItems.length, "Diagnostic selector should not duplicate items.");

const grammarPractice = selectEnglishPracticeItems(englishCatalog, {
  limit: 4,
  skillIds: ["eng.control_clause_structure"],
  attemptedItemIds: diagnosticItems.map((question) => question.id),
});
assert(grammarPractice.length > 0, "English practice selector should return targeted grammar practice.");
assert(grammarPractice.every((question) => question.skillIds.includes("eng.control_clause_structure")), "Practice selector should respect skill filters.");
assert(grammarPractice.every((question) => !diagnosticItems.some((diagnostic) => diagnostic.id === question.id)), "Practice selector should skip attempted items.");

const englishGrammarQuery = queryContentItems(englishCatalog.items, {
  programId: "cpe",
  skillIds: ["eng.control_clause_structure"],
  mode: "practice",
  limit: 3,
});
assert(englishGrammarQuery.items.length > 0 && englishGrammarQuery.items.length <= 3, "English content query should return a scoped practice page.");
assert(englishGrammarQuery.items.every((question) => question.programIds.includes("cpe")), "English content query should respect program filters.");
assert(englishGrammarQuery.items.every((question) => question.skillIds.includes("eng.control_clause_structure")), "English content query should respect skill filters.");

function loadSatPublicPackage(): SatPublicStudentPackage {
  const candidates = [
    path.resolve(process.cwd(), "apps/sat-studio/artifacts/sat-studio-public-content-package-latest.json"),
    path.resolve(process.cwd(), "../../apps/sat-studio/artifacts/sat-studio-public-content-package-latest.json"),
  ];
  const packagePath = candidates.find((candidate: string) => fs.existsSync(candidate));
  assert(Boolean(packagePath), "SAT public content package should exist for adapter smoke test.");
  return JSON.parse(fs.readFileSync(packagePath, "utf8")) as SatPublicStudentPackage;
}

function loadMiuMathQuestions(): MiuMathQuestion[] {
  const candidates = [
    path.resolve(process.cwd(), "apps/miumath-app/public/data/questions_db.json"),
    path.resolve(process.cwd(), "../../apps/miumath-app/public/data/questions_db.json"),
  ];
  const questionsPath = candidates.find((candidate: string) => fs.existsSync(candidate));
  assert(Boolean(questionsPath), "MiuMath question bank should exist for adapter smoke test.");
  return JSON.parse(fs.readFileSync(questionsPath, "utf8")) as MiuMathQuestion[];
}

function loadCaeMockQuestions(): Array<EnglishExamTest["sections"][number]["questionGroups"][number]["questions"][number] & { tags?: string[] }> {
  const mocksPath = path.resolve(process.cwd(), "src/mocks");
  const files = fs.readdirSync(mocksPath).filter((file: string) => file.includes("cae") && file.endsWith(".json"));
  const questions: Array<EnglishExamTest["sections"][number]["questionGroups"][number]["questions"][number] & { tags?: string[] }> = [];
  files.forEach((file: string) => {
    const test = JSON.parse(fs.readFileSync(path.join(mocksPath, file), "utf8")) as EnglishExamTest;
    (test.sections || []).forEach((section) => {
      (section.questionGroups || []).forEach((group) => {
        (group.questions || []).forEach((question) => questions.push(question as typeof questions[number]));
      });
    });
  });
  return questions;
}
