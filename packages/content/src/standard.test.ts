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
import { getMath6ManualEnrichmentCount } from "./math6-enrichment";
import { buildMath6ContentGuardReport } from "./math6-content-guard-report";
import { generateMath6GeometryFigure, needsOriginalGeometryImage } from "./math6-geometry-figures";
import { buildMath10LearningCatalogFromRawSources, buildMath6LearningCatalogFromRawSources, buildMath9LearningCatalogFromRawSources, buildMathLearningCatalog, selectMathDiagnosticItems, selectMathPracticeItems } from "./math-learning";
import { buildMath10QuestionItemsFromRawSources } from "./math10-import";
import { buildMath10ContentGuardReport } from "./math10-content-guard-report";
import {
  MATH9_ACCESS_INDEX,
  MATH9_CHECKPOINTS,
  MATH9_LEARNING_MATRIX,
  buildMath9CoverageMatrix,
  getMath9PatternsByLevel,
  getMath9TopicsByAxis,
} from "./math9-plan";
import { buildMath9QuestionItemsFromRawSources, extractMath9ExerciseBlocks, matchMath9TopicForSource } from "./math9-import";
import { buildMath9ContentGuardReport } from "./math9-content-guard-report";
import {
  MATH7_ACCESS_INDEX,
  MATH7_CHECKPOINTS,
  MATH7_LEARNING_MATRIX,
  buildMath7CoverageMatrix,
  getMath7PatternsByLevel,
  getMath7TopicById,
  getMath7TopicsByAxis,
} from "./math7-plan";
import { buildMath7QuestionItemsFromRawSources, extractMath7ExerciseBlocks, matchMath7TopicForSource } from "./math7-import";
import { buildMath7ContentGuardReport } from "./math7-content-guard-report";
import {
  MATH8_ACCESS_INDEX,
  MATH8_CHECKPOINTS,
  MATH8_LEARNING_MATRIX,
  buildMath8CoverageMatrix,
  getMath8PatternsByLevel,
  getMath8TopicById,
  getMath8TopicsByAxis,
} from "./math8-plan";
import { buildMath8QuestionItemsFromRawSources, extractMath8ExerciseBlocks, matchMath8TopicForSource } from "./math8-import";
import { buildMath8ContentGuardReport } from "./math8-content-guard-report";
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

const math6SourceSolutionImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "de-kiem-tra-co-dap-an-toan-6.doc",
    relativePath: "de-kiem-tra-co-dap-an-toan-6.doc",
    extension: "doc",
    text: [
      "Cau 1: Tinh nhanh 25.27.4.",
      "Cau 2: Tim x biet 2(x + 25) = 60.",
      "----- HUONG DAN CHAM -----",
      "Cau 1: 25.27.4 = (25.4).27 = 100.27 = 2700.",
      "Cau 2: 2(x + 25) = 60 => x + 25 = 30 => x = 5.",
    ].join("\n"),
  },
]);
assert(math6SourceSolutionImport.items.length === 2, "Math 6 importer should not import source answer-key blocks as extra questions.");
assert(math6SourceSolutionImport.items.every((question) => question.metadata?.solutionSource === "source_file"), "Math 6 importer should attach aligned source-file solutions.");
assert(String(math6SourceSolutionImport.items[0]?.correctAnswer || "").includes("2700"), "Math 6 source solution should populate the answer key.");
assert(String(math6SourceSolutionImport.items[0]?.explanation || "").includes("Cach quan sat theo SGK lop 6"), "Math 6 source solution should add SGK-aligned thinking guidance.");
const math6SourceSolutionGuard = buildMath6ContentGuardReport([
  {
    fileName: "de-kiem-tra-co-dap-an-toan-6.doc",
    relativePath: "de-kiem-tra-co-dap-an-toan-6.doc",
    extension: "doc",
    text: [
      "Cau 1: Tinh nhanh 25.27.4.",
      "Cau 2: Tim x biet 2(x + 25) = 60.",
      "----- HUONG DAN CHAM -----",
      "Cau 1: 25.27.4 = (25.4).27 = 100.27 = 2700.",
      "Cau 2: 2(x + 25) = 60 => x + 25 = 30 => x = 5.",
    ].join("\n"),
  },
], { generatedAt: "2026-06-05T00:00:00.000Z" });
assert(math6SourceSolutionGuard.report.pedagogy.scoredPracticeReady === 2, "Math 6 guard should allow aligned source-solution items into scored practice.");
const math6PointLineFigure = generateMath6GeometryFigure(
  "Bai 4. Ve duong thang xy; lay diem A nam tren duong thang xy, diem B khong nam tren duong thang xy. Ke ten cac tia goc A va hai tia doi nhau.",
  "math6.geometry.points_lines_segments",
);
assert(math6PointLineFigure?.kind !== "angle" && math6PointLineFigure?.kind !== "angle_bisector", "Math 6 point-line prompts should not be rendered as angle figures because of 'tia goc'.");
assert(!String(math6PointLineFigure?.svg || "").includes("?°"), "Math 6 point-line generated figures should not include an unknown angle label.");

const math6PrimeFactorSeedSource = {
  fileName: "[123doc.vn] - luyen-tap-phan-tich-ra-thua-so-nguyen-to.doc",
  relativePath: "[123doc.vn] - luyen-tap-phan-tich-ra-thua-so-nguyen-to.doc",
  extension: "doc",
  text: [
    "Bài 1: Phân tích các số sau ra thừa số nguyên tố rồi tìm ước của chúng: a) 119 b) 625 c) 200",
    "Bài 2: Phân tích các số sau ra thừa số nguyên rồi cho biết số đó chia hết cho các số nguyên tố nào: a) 1764 b) 3936",
    "Bài 3: Phân tích các số sau ra thừa số nguyên tố bằng cách hợp lí nhất a) 700 b) 18 000 c) 1600",
    "Bài 4: Tích của ba số lẻ liên tiếp bằng 105, tìm ba số đó. Tích của hai số tự nhiên có hai chữ số bằng 204. Tìm hai số đó. Tích của bốn số tự nhiên liên tiếp bằng 360, tìm số lớn nhất.",
    "Bài 5: Tích của hai số a và b bằng 42. Biết a < b, tìm hai số a; b. Tích của hai số tự nhiên a và b bằng 102, hiệu a – b = 49. Tìm hai số a; b đó Tìm các số tự nhiên x; y biết ( x + 5)( y + 2) = 102",
    "Bài 6: Viết tập hợp các ước của các số sau: a) a = 7.13 b) 26 c) 32. 7",
    "Bài 7: Thay dấu * bằng chữ số thích hợp, biết các số đã cho có dấu hiệu chia hết.",
    "Bài 8: Tìm các số tự nhiên n biết: 2 + 4 + 6 + 8 + ……..+ 2n = 210 1 + 3 + 5 + …..( 2n – 1)= 225",
    "Bài 9: Tính cạnh một hình vuông biết diện tích của nó bằng: a) 324 b) 625",
  ].join("\n"),
};
const math6PrimeFactorSeedImport = buildMath6QuestionItemsFromRawSources([math6PrimeFactorSeedSource]);
const math6PrimeFactorSeedEnrichedItems = math6PrimeFactorSeedImport.items.filter((question) => question.tags.includes("pedagogy:manual_enriched"));
assert(getMath6ManualEnrichmentCount() === 6, "Math 6 manual enrichment seed should track the first reviewed answer-key batch.");
assert(math6PrimeFactorSeedImport.items.length === 9, "Math 6 enrichment seed fixture should keep source block indexes stable.");
assert(math6PrimeFactorSeedEnrichedItems.length === 6, "Math 6 enrichment seed should enrich only the manually reviewed items.");
assert(math6PrimeFactorSeedEnrichedItems.every((question) => question.correctAnswer && String(question.explanation || "").includes("Cách quan sát")), "Math 6 enriched items should include answers and thinking guidance.");
const math6PrimeFactorSeedGuard = buildMath6ContentGuardReport([math6PrimeFactorSeedSource], { generatedAt: "2026-06-05T00:00:00.000Z" });
assert(math6PrimeFactorSeedGuard.report.pedagogy.scoredPracticeReady >= 6, "Math 6 guard should mark manually enriched display-ready items as scored-practice-ready and may include safe auto-enriched items.");
assert(math6PrimeFactorSeedGuard.report.pedagogy.missingCorrectAnswer <= 3, "Math 6 guard should keep unresolved seed items blocked from scoring while allowing safe auto-enrichment.");
const math6PrimeFactorSeedCatalog = buildMath6LearningCatalogFromRawSources([math6PrimeFactorSeedSource]);
assert(math6PrimeFactorSeedCatalog.catalog.items.length >= 6, "Math 6 raw-source catalog should expose enriched scored-practice items by default.");

const math6AutoSetAndSegmentImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "de-kiem-tra-auto-sgk-toan-6.doc",
    relativePath: "de-kiem-tra-auto-sgk-toan-6.doc",
    extension: "doc",
    text: [
      "Bai 1: Tap hop A gom cac so tu nhien la uoc cua 6. Tap hop B gom cac so tu nhien nho hon 10 va chia het cho 2. a) Viet tap hop A, B bang cach liet ke. b) Tim tap hop A giao B.",
      "Bai 2: Tren tia Ox lay hai diem A va B sao cho OA = 4cm, OB = 8cm. Diem A co nam giua O va B khong? Tinh AB. Diem A co la trung diem cua OB khong?",
    ].join("\n"),
  },
]);
assert(math6AutoSetAndSegmentImport.items.length === 2, "Math 6 auto-enrichment fixture should import both safe SGK-style prompts.");
assert(String(math6AutoSetAndSegmentImport.items[0]?.correctAnswer || "").includes("A giao B"), "Math 6 auto-enrichment should solve safe set intersection prompts.");
assert(String(math6AutoSetAndSegmentImport.items[1]?.correctAnswer || "").includes("A la trung diem"), "Math 6 auto-enrichment should solve safe same-ray midpoint prompts.");
assert(math6AutoSetAndSegmentImport.items.every((question) => String(question.explanation || "").includes("Cach quan sat theo SGK lop 6")), "Math 6 auto-enrichment should add SGK thinking guidance.");

const math6AutoDivisibilityImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "dau-hieu-chia-het-auto-sgk-toan-6.doc",
    relativePath: "dau-hieu-chia-het-auto-sgk-toan-6.doc",
    extension: "doc",
    text: [
      "Bai 1: (1 diem) Tim UCLN(24, 36).",
      "Bai 2: Trong cac so: 4827; 5670; 6915; 2007. So nao chia het cho 3 ma khong chia het cho 9? So nao chia het cho ca 2; 3; 5 va 9?",
      "Bai 3: Thay cac chu so x, y boi cac chu so thich hop de B = 56x3y chia het cho ca ba so 2, 5, 9",
      "Bai 4: Tim tap hop cac uoc cua: 10, 20, 30.",
    ].join("\n"),
  },
]);
assert(String(math6AutoDivisibilityImport.items[0]?.correctAnswer || "").includes("UCLN(24, 36) = 12"), "Math 6 auto-enrichment should ignore point values in exercise headers.");
assert(String(math6AutoDivisibilityImport.items[1]?.correctAnswer || "").includes("4827"), "Math 6 auto-enrichment should solve safe divisibility-list prompts.");
assert(String(math6AutoDivisibilityImport.items[2]?.correctAnswer || "").includes("x = 4, y = 0"), "Math 6 auto-enrichment should solve safe x/y divisibility digit-fill prompts.");
assert(String(math6AutoDivisibilityImport.items[3]?.correctAnswer || "").includes("U(30)"), "Math 6 auto-enrichment should list divisors for safe divisor-list prompts.");

const math6AutoCountingImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "hinh-hoc-dem-auto-sgk-toan-6.doc",
    relativePath: "hinh-hoc-dem-auto-sgk-toan-6.doc",
    extension: "doc",
    text: [
      "Bai 1: Cho 101 duong thang trong do bat cu hai duong thang nao cung cat nhau, khong co ba duong thang nao dong quy. Tinh so giao diem cua chung.",
      "Bai 2: Cho 6 tia chung goc. Co bao nhieu goc trong hinh ve? Vay voi n tia chung goc co bao nhieu goc?",
    ].join("\n"),
  },
]);
assert(String(math6AutoCountingImport.items[0]?.correctAnswer || "").includes("5050"), "Math 6 auto-enrichment should solve pairwise line-intersection counting.");
assert(String(math6AutoCountingImport.items[1]?.correctAnswer || "").includes("n(n - 1)"), "Math 6 auto-enrichment should solve common-origin ray angle counting.");

const math6AutoDigitCountingImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "30DeHSGToan6.doc",
    relativePath: "30DeHSGToan6.doc",
    extension: "doc",
    text: "Bai 1: Co bao nhieu so co 3 chu so trong do co dung mot chu so 5?",
  },
]);
assert(String(math6AutoDigitCountingImport.items[0]?.correctAnswer || "").includes("225"), "Math 6 auto-enrichment should solve exact-one-digit counting.");

const math6AutoWordProblemImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    relativePath: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    extension: "doc",
    text: [
      "Bai 1: Mot quyen sach co 246 trang. Phai dung bao nhieu chu so de danh so trang quyen sach nay?",
      "Bai 2: So hoc sinh khoi 6 cua mot truong trong khoang tu 200 den 400, khi xep hang 12, hang 15, hang 18 deu thua 5 hoc sinh. Tinh so hoc sinh khoi 6 cua truong do.",
      "Bai 3: Cho doan thang AB = 8cm. Tren tia AB lay diem M sao cho AM = 4cm. M co la trung diem cua AB khong?",
    ].join("\n"),
  },
]);
assert(String(math6AutoWordProblemImport.items[0]?.correctAnswer || "").includes("630"), "Math 6 auto-enrichment should solve page-number digit counting.");
assert(String(math6AutoWordProblemImport.items[1]?.correctAnswer || "").includes("365"), "Math 6 auto-enrichment should solve bounded same-remainder row problems.");
assert(String(math6AutoWordProblemImport.items[2]?.correctAnswer || "").includes("M la trung diem"), "Math 6 auto-enrichment should solve safe segment-midpoint prompts.");

const math6AutoAuditBatchImport = buildMath6QuestionItemsFromRawSources([
  { fileName: "math6-audit-set-theory.doc", relativePath: "math6-audit-set-theory.doc", extension: "doc", text: "Bai 1: Mot tap hop co the co bao nhieu phan tu?" },
  { fileName: "math6-audit-subsets.doc", relativePath: "math6-audit-subsets.doc", extension: "doc", text: "Bai 1: Cho tap hop A = {1; 2; 3; 4; 5}. Hay viet cac tap con cua A gom toan so chan va cac tap con cua A gom toan so le." },
  { fileName: "math6-audit-integers.doc", relativePath: "math6-audit-integers.doc", extension: "doc", text: "Bai 1: Sap xep cac so nguyen sau theo thu tu tang dan: -25; -116; 6; 0; -10." },
  { fileName: "math6-audit-primes.doc", relativePath: "math6-audit-primes.doc", extension: "doc", text: "Bai 1: Liet ke cac so nguyen to nho hon 100." },
  { fileName: "math6-audit-lines.doc", relativePath: "math6-audit-lines.doc", extension: "doc", text: "Bai 1: Cho 100 diem trong do khong co ba diem nao thang hang. Cu qua 2 diem ve duoc mot duong thang. Co bao nhieu duong thang?" },
  { fileName: "math6-audit-midpoint.doc", relativePath: "math6-audit-midpoint.doc", extension: "doc", text: "Bai 1: Tren tia Ox lay A, B sao cho OA = 3cm, OB = 9cm. M la trung diem cua AB. Tinh OM." },
]);
const math6AutoAuditNaturalOpsImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    relativePath: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    extension: "doc",
    text: [
      "Bai 1: Ba khoi lop 6, 7, 8 theo thu tu co 147 hoc sinh, 189 hoc sinh, 168 hoc sinh xep thanh cac hang doc sao cho so hoc sinh moi hang bang nhau. Co the xep nhieu nhat moi hang bao nhieu hoc sinh?",
      "Bai 2: Tinh tong S = 7 + 10 + 13 + ... + 100. Day tren co bao nhieu so hang? So hang thu 24 la bao nhieu?",
    ].join("\n"),
  },
]);
assert(String(math6AutoAuditBatchImport.items[0]?.correctAnswer || "").includes("vo so phan tu"), "Math 6 auto audit batch should solve set-cardinality theory prompts.");
assert(String(math6AutoAuditBatchImport.items[1]?.correctAnswer || "").includes("{2, 4}"), "Math 6 auto audit batch should solve safe subset listing prompts.");
assert(String(math6AutoAuditNaturalOpsImport.items[0]?.correctAnswer || "").includes("21 hoc sinh"), "Math 6 auto audit batch should solve GCD grouping word problems.");
assert(String(math6AutoAuditNaturalOpsImport.items[1]?.correctAnswer || "").includes("S = 1712"), "Math 6 auto audit batch should solve arithmetic progression sums.");
assert(String(math6AutoAuditBatchImport.items[2]?.correctAnswer || "").includes("-116; -25; -10; 0; 6"), "Math 6 auto audit batch should solve integer ordering prompts.");
assert(String(math6AutoAuditBatchImport.items[3]?.correctAnswer || "").includes("97"), "Math 6 auto audit batch should list primes below 100.");
assert(String(math6AutoAuditBatchImport.items[4]?.correctAnswer || "").includes("4950"), "Math 6 auto audit batch should solve no-three-collinear line counting.");
assert(String(math6AutoAuditBatchImport.items[5]?.correctAnswer || "").includes("OM = 6"), "Math 6 auto audit batch should solve midpoint length prompts.");

const math6AutoAuditProofBatchImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    relativePath: "audit/math6-auto-proof-batch.doc",
    extension: "doc",
    text: [
      "Bai 1: Tim so tu nhien n sao cho: a, n + 6 chia het cho n + 2 b, 2n + 3 chia het cho n - 2 c, 3n + 1 chia het cho 11 - 2n.",
      "Bai 2: Tim so nguyen to p sao cho cac so sau cung la so nguyen to: p + 6, p + 8, p + 12, p + 14.",
    ].join("\n"),
  },
  {
    fileName: "Bo - de-on-tap-hoc-ki-2-mon-toan-lop-6-nam-hoc-2014-2015.doc",
    relativePath: "audit/math6-auto-angle-batch.doc",
    extension: "doc",
    text: "Bai 1: Tren cung mot nua mat phang bo la duong thang chua tia Ox, ve hai tia OA va OB sao cho goc xOA = 650; goc xOB = 1300. Ve tia Oy la tia doi cua tia Ox. Tinh so do goc yOB.",
  },
  {
    fileName: "De-thi-Tuyen-sinh-lop6-Nguyen-Tri-Phuong-2012.doc",
    relativePath: "audit/math6-auto-decimal-batch.doc",
    extension: "doc",
    text: "Bai 1: Mot ve xem phim co gia goc 20 000 dong. An mua 4 ve co su dung phieu giam gia 25%. Binh mua 5 ve co su dung phieu giam gia 30%. Binh phai tra nhieu hon An bao nhieu tien?",
  },
]);
assert(String(math6AutoAuditProofBatchImport.items[0]?.correctAnswer || "").includes("n = 0, 2"), "Math 6 auto audit proof batch should solve divisor-parameter prompts.");
assert(String(math6AutoAuditProofBatchImport.items[1]?.correctAnswer || "").includes("p = 5"), "Math 6 auto audit proof batch should solve prime modulo prompts.");
assert(String(math6AutoAuditProofBatchImport.items[2]?.correctAnswer || "").includes("goc yOB = 50"), "Math 6 auto audit proof batch should solve angle-bisector adjacent prompts.");
assert(String(math6AutoAuditProofBatchImport.items[3]?.correctAnswer || "").includes("10 000"), "Math 6 auto audit proof batch should solve percent-discount prompts.");

const math6FormulaImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Bai tap phan so.doc",
    relativePath: "Bai tap phan so.doc",
    extension: "doc",
    text: "Bai 1: Thuc hien phep tinh a) {{formula:/assets/math6/formulas/sample/image001.gif|w=66|h=44}} b) {{formula:/assets/math6/formulas/sample/image002.gif|w=42|h=20}}.",
  },
]);
assert(math6FormulaImport.items.length === 1, "Math 6 rich importer should keep formula-image exercise blocks.");
assert(math6FormulaImport.items[0]?.tags.includes("formula:recovered_asset"), "Math 6 formula assets should be tagged for rich rendering.");
assert((math6FormulaImport.items[0]?.metadata?.formulaAssetCount as number) === 2, "Math 6 formula tokens should be captured in metadata.");

const math6LegacyFontImport = buildMath6QuestionItemsFromRawSources([
  {
    fileName: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    relativePath: "Bai tap danh cho hoc sinh lop 6 tu hoc.doc",
    extension: "doc",
    text: "BAI TAP 1: T\u00d7m c\u00b8c gi\u00b8 tr\u00de nguy\u00aan c\u00f1a n \u00ae\u00d3 ph\u00a9n s\u00e8 A c\u00e3 gi\u00b8 tr\u00de l\u00b5 s\u00e8 nguy\u00aan.",
  },
]);
assert(math6LegacyFontImport.items[0]?.prompt.includes("Tìm các giá trị nguyên"), "Math 6 importer should decode TCVN3 legacy Vietnamese text.");
assert(!math6LegacyFontImport.items[0]?.prompt.includes("T\u00d7m c\u00b8c"), "Math 6 importer should not keep TCVN3 marker text in prompts.");

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

const math6GeneratedFigure = generateMath6GeometryFigure(
  "Cau 1: Cho duong thang xy, diem O nam tren xy. Tren tia Ox lay diem N, tren tia Oy lay diem M.",
  "math6.geometry.points_lines_segments",
);
assert(math6GeneratedFigure?.kind === "opposite_rays", "Math 6 geometry generator should draw opposite-ray prompts.");
assert(math6GeneratedFigure.svg.includes("<svg"), "Generated Math 6 figures should be SVG payloads.");
assert(needsOriginalGeometryImage("Cau 1: Cho hinh ve ben. Tinh do dai AB."), "Image-dependent geometry prompts should be gated for original-image review.");
assert(!needsOriginalGeometryImage("Cau 1: Ve hinh theo cach dien dat: cho duong thang xy."), "Construct-from-text prompts should not be gated as missing original images.");

const math6GeometryGuard = buildMath6ContentGuardReport([
  {
    fileName: "Chuyen de diem duong thang tia.doc",
    relativePath: "Chuyen de diem duong thang tia.doc",
    extension: "doc",
    text: "Cau 1: Cho duong thang xy, diem O nam tren xy. Tren tia Ox lay diem N, tren tia Oy lay diem M.",
  },
], { generatedAt: "2026-06-04T00:00:00.000Z" });
assert(math6GeometryGuard.report.stats.generatedFigures === 1, "Math 6 guard should count generated SVG figures.");
assert(math6GeometryGuard.report.display.needsOriginalImage === 0, "Generated geometry figures should satisfy the image display gate.");
assert(math6GeometryGuard.report.pedagogy.scoredPracticeReady === 0, "Math 6 guard should block unscored imported questions from scored practice.");
assert(math6GeometryGuard.report.pedagogy.missingCorrectAnswer === 1, "Math 6 pedagogy guard should require a correct answer before scored practice.");
assert(math6GeometryGuard.report.pedagogy.missingThinkingGuide === 1, "Math 6 pedagogy guard should require thinking guidance before scored practice.");
assert(math6GeometryGuard.report.adapter.pass, "Math 6 guard output should validate as standard QuestionItems.");

const math6CatalogFromGuard = buildMathLearningCatalog(math6GeometryGuard.items, {
  programIds: ["vn_math_6"],
  grades: [6],
  displayReadyItemIds: math6GeometryGuard.report.displayReadyItemIds,
});
assert(math6CatalogFromGuard.items.length === 1, "Generic Math catalog should keep display-ready Math 6 items.");
assert(math6CatalogFromGuard.coverage.generatedFigures === 1, "Generic Math catalog should count generated geometry figures.");
assert(selectMathPracticeItems(math6CatalogFromGuard, { limit: 1, topicIds: ["math6.geometry.points_lines_segments"] }).length === 1, "Generic Math practice selector should filter by topic.");
assert(selectMathDiagnosticItems(math6CatalogFromGuard, [], { limit: 1, programId: "vn_math_6" }).length === 1, "Generic Math diagnostic selector should return Math 6 items.");

const math6CatalogFromRaw = buildMath6LearningCatalogFromRawSources([
  {
    fileName: "Chuyen de diem duong thang tia.doc",
    relativePath: "Chuyen de diem duong thang tia.doc",
    extension: "doc",
    text: "Cau 1: Cho duong thang xy, diem O nam tren xy. Tren tia Ox lay diem N, tren tia Oy lay diem M.",
  },
]);
assert(math6CatalogFromRaw.catalog.items.length === 0, "Math 6 raw-source catalog helper should not expose unscored items for scored practice.");
const math6ReviewCatalogFromRaw = buildMath6LearningCatalogFromRawSources([
  {
    fileName: "Chuyen de diem duong thang tia.doc",
    relativePath: "Chuyen de diem duong thang tia.doc",
    extension: "doc",
    text: "Cau 1: Cho duong thang xy, diem O nam tren xy. Tren tia Ox lay diem N, tren tia Oy lay diem M.",
  },
], { includeUnscoredPractice: true });
assert(math6ReviewCatalogFromRaw.catalog.items.length === 1, "Math 6 review mode can expose display-ready unscored items for internal review.");
assert(math6CatalogFromRaw.guardReport.adapter.pass, "Math 6 raw-source catalog helper should keep guard validation status.");

assert(MATH9_LEARNING_MATRIX.length >= 18, "Math 9 matrix should expose core, exam10, and advanced topic sets.");
assert(MATH9_LEARNING_MATRIX.every((topic) => topic.grade === 9), "Every Math 9 matrix topic should be grade-scoped.");
assert(MATH9_LEARNING_MATRIX.every((topic) => topic.programIds.includes("vn_math_9")), "Every Math 9 topic should target the Grade 9 program.");
assert(MATH9_LEARNING_MATRIX.every((topic) => topic.programIds.includes("vn_math_vao_10")), "Every Math 9 topic should also support entrance-exam review.");
assert(MATH9_LEARNING_MATRIX.every((topic) => topic.sourceFiles.length > 0), "Every Math 9 topic should retain source file lineage.");
assert(MATH9_ACCESS_INDEX.grade["9"].length === MATH9_LEARNING_MATRIX.length, "Math 9 access index should expose every topic by grade.");
assert(getMath9TopicsByAxis("examTarget", "exam10").some((topic) => topic.id === "math9.assessment.exam10_synthesis"), "Math 9 exam10 access should include synthesis review.");
assert(getMath9TopicsByAxis("strand", "geometry").some((topic) => topic.id === "math9.geometry.cyclic_tangent_secant"), "Math 9 geometry access should include circle proof topics.");
assert(getMath9PatternsByLevel("exam10").length >= 8, "Math 9 exam10 patterns should support advanced entrance-exam routing.");
assert(buildMath9CoverageMatrix().every((row) => row.sourceCount > 0 && row.patternCount > 0), "Math 9 coverage matrix should include sources and patterns per topic.");
assert(MATH9_CHECKPOINTS.some((checkpoint) => checkpoint.id === "math9.checkpoint.exam10_readiness"), "Math 9 plan should include entrance-exam readiness checkpoint.");

const math9RawText = [
  "Cau 1: Rut gon bieu thuc chua can A = sqrt(x) + 1 voi x >= 0.",
  "Cau 2: Giai he phuong trinh 2x + y = 5 va x - y = 1.",
  "Cau 3: Cho duong tron (O), tiep tuyen tai A cat duong thang BC. Chung minh tu giac noi tiep.",
].join("\n");
const math9Blocks = extractMath9ExerciseBlocks(math9RawText);
assert(math9Blocks.length === 3, "Math 9 extractor should split exercise blocks by Bai/Cau headers.");
const math9TopicMatch = matchMath9TopicForSource({
  fileName: "thuvienhoclieu.com-CHUYEN-DE-5-RUT-GON-BIEU-THUC.docx",
  relativePath: "thuvienhoclieu.com-CHUYEN-DE-5-RUT-GON-BIEU-THUC.docx",
  extension: "docx",
  text: math9RawText,
});
assert(math9TopicMatch?.topic.id === "math9.algebra.radicals_transform", "Math 9 source matcher should map radical simplification sources.");
const math9Import = buildMath9QuestionItemsFromRawSources([
  {
    fileName: "de-tong-hop-toan-9.docx",
    relativePath: "de-tong-hop-toan-9.docx",
    extension: "docx",
    text: math9RawText,
  },
]);
assert(math9Import.items.length === 3, "Math 9 importer should convert mixed extracted blocks to QuestionItems.");
assert(math9Import.items.every((question) => question.programIds.includes("vn_math_9")), "Math 9 imported questions should target Grade 9.");
assert(math9Import.items.some((question) => question.metadata?.topicId === "math9.algebra.radicals_transform"), "Math 9 mixed import should classify radical simplification.");
assert(math9Import.items.some((question) => question.metadata?.topicId === "math9.algebra.systems"), "Math 9 mixed import should classify systems.");
assert(math9Import.items.some((question) => question.metadata?.topicId === "math9.geometry.cyclic_tangent_secant"), "Math 9 mixed import should classify circle tangent/cyclic geometry.");
assert(validateStandardContentBundle({ questions: math9Import.items }).length === 0, "Math 9 imported QuestionItems should validate cleanly.");

const math9SourceSolutionSource = {
  fileName: "de-on-vao-10-he-phuong-trinh.docx",
  relativePath: "de-on-vao-10-he-phuong-trinh.docx",
  extension: "docx",
  text: [
    "Cau 1: Giai he phuong trinh 2x + y = 7 va x - y = 2. Trinh bay day du cac buoc bien doi de tim nghiem cua he phuong trinh.",
    "Cau 2: Tim x, y biet x + y = 5 va 2x - y = 4. Neu ro cach chon phep cong dai so hoac phep the.",
    "----- HUONG DAN CHAM -----",
    "Cau 1: Tu x - y = 2 suy ra y = x - 2. The vao 2x + y = 7 duoc 3x - 2 = 7 nen x = 3, y = 1. Vay he co nghiem (3; 1).",
    "Cau 2: Cong hai phuong trinh duoc 3x = 9 nen x = 3, y = 2. Vay he co nghiem (3; 2).",
  ].join("\n"),
};
const math9SourceSolutionImport = buildMath9QuestionItemsFromRawSources([math9SourceSolutionSource]);
assert(math9SourceSolutionImport.items.length === 2, "Math 9 importer should attach answer-key blocks instead of importing them as questions.");
assert(math9SourceSolutionImport.items.every((question) => question.metadata?.solutionStatus === "source_solution"), "Math 9 importer should tag source-file solutions.");
assert(math9SourceSolutionImport.items.every((question) => !String(question.prompt).toLowerCase().includes("huong dan cham")), "Math 9 prompts should not keep source answer-key markers.");
assert(String(math9SourceSolutionImport.items[0]?.correctAnswer || "").includes("(3; 1)"), "Math 9 source solution should populate correctAnswer from the worked solution.");
assert(String(JSON.stringify(math9SourceSolutionImport.items[0]?.explanation || "")).includes("Nhan dien"), "Math 9 source solution should include recognition/thinking guidance.");
const math9SourceSolutionGuard = buildMath9ContentGuardReport([math9SourceSolutionSource], { generatedAt: "2026-06-05T00:00:00.000Z" });
assert(math9SourceSolutionGuard.report.pedagogy.scoredPracticeReady === 2, "Math 9 guard should allow aligned source-solution items into scored practice.");
const math9SourceSolutionCatalog = buildMath9LearningCatalogFromRawSources([math9SourceSolutionSource]);
assert(math9SourceSolutionCatalog.catalog.items.length === 2, "Math 9 raw-source catalog should expose scored-practice-ready source-solution items by default.");

const math10BlockedGlyphCatalog = buildMath10LearningCatalogFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Xet menh de P: 2 + 3 = 5. Tim phu dinh cua menh de P va neu tinh dung sai.",
      "Cau 2: Cong thuc bi loi font \uf080 can loai khoi he thong hoc sinh.",
    ].join("\n"),
  },
], { includeUnscoredPractice: true });
assert(math10BlockedGlyphCatalog.catalog.items.length === 1, "Math 10 learner catalog should publish only display-ready items.");
assert(math10BlockedGlyphCatalog.catalog.blockedItems.length === 1, "Math 10 learner catalog should retain blocked raw items only for audit.");
assert(!math10BlockedGlyphCatalog.catalog.items.some((item) => String(item.prompt).includes("\uf080")), "Math 10 learner catalog should not expose unrecovered private-use glyphs.");

const math10AutoSolutionImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Trong cac cau sau, co bao nhieu cau la menh de?",
      "Co len, sap doi roi!",
      "So 15 la so nguyen to.",
      "Tong cac goc cua mot tam giac la 180 do.",
      "So nguyen duong la so tu nhien khac 0.",
      "A. 3. B. 2. C. 4. D. 1.",
      "Cau 2: Trong cac cau sau, cau nao khong phai la menh de?",
      "A. 11 la so vo ti.",
      "B. Tat ca cac so tu nhien deu khong am.",
      "C. Hom nay lanh the nhi?",
      "D. Phuong trinh x^2 - 2x + 5 = 0 vo nghiem.",
      "Cau 3: Cau nao trong cac cau sau khong phai la menh de.",
      "A. x + 5 = 10.",
      "B. 4 la mot so vo ti.",
      "C. Hom nay la thu may?",
      "D. Phuong trinh x^2 - 2x + 5 = 0 vo nghiem.",
      "C.",
      "Cau 4: Trong cac cau sau, co bao nhieu cau khong phai la menh de?",
      "a) Troi nong qua!",
      "b) Viet Nam khong nam o khu vuc Dong Nam A.",
      "c) 10 - 2 = 8.",
      "d) Nam 2019 la nam nhuan.",
      "A. 1. B. 2. C. 3. D. 4.",
    ].join("\n"),
  },
]);
assert(math10AutoSolutionImport.items.length === 4, "Math 10 auto-solution fixture should import four logic questions.");
assert(String(math10AutoSolutionImport.items[0]?.correctAnswer || "") === "A", "Math 10 auto solver should count proposition prompts.");
assert(String(math10AutoSolutionImport.items[1]?.correctAnswer || "") === "C", "Math 10 auto solver should solve non-proposition choice prompts.");
assert(String(math10AutoSolutionImport.items[2]?.correctAnswer || "") === "C", "Math 10 auto solver should recover trailing inline choice answer.");
assert(String(math10AutoSolutionImport.items[3]?.correctAnswer || "") === "A", "Math 10 auto solver should count non-proposition prompts.");
assert(!String(math10AutoSolutionImport.items[2]?.prompt || "").trim().endsWith("C."), "Math 10 auto solver should remove leaked trailing answer from prompt.");
assert(math10AutoSolutionImport.items.every((question) => question.metadata?.solutionStatus === "generated_miumath_solution"), "Math 10 auto-solved items should be tagged as generated MiuMath solutions.");
assert(String(JSON.stringify(math10AutoSolutionImport.items[0]?.explanation || "")).includes("Bay can tranh"), "Math 10 generated solution should include trap guidance.");
const math10ReferencedPropositionImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Trong cac cau sau day, cau nao la menh de?",
      "a) Cac ban hay lam bai di.",
      "b) Ban co cham hoc khong.",
      "c) Viet Nam la mot nuoc thuoc chau A.",
      "d) Anh hoc lop may?",
      "A. b). B. d). C. a). D. c).",
      "Cau 2: Trong cac cau sau, cau nao khong phai la menh de?",
      "a) 4 la so chan.",
      "b) Hay lam bai di.",
      "c) Viet Nam thuoc chau A.",
      "d) 3 + 5 = 8.",
      "A. a). B. b). C. c). D. d).",
    ].join("\n"),
  },
]);
assert(String(math10ReferencedPropositionImport.items[0]?.correctAnswer || "") === "D", "Math 10 proposition solver should follow a/b/c/d references back to the listed sentence.");
assert(String(math10ReferencedPropositionImport.items[1]?.correctAnswer || "") === "B", "Math 10 referenced proposition solver should identify the referenced command as non-proposition.");
assert(math10ReferencedPropositionImport.items.every((question) => String(question.metadata?.generatedSolutionKind || "").includes("referenced")), "Math 10 referenced proposition items should use the reference-aware solver.");
const math10ConverseImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cõu 1: Cho mệnh đề: “Nếu một tứ giỏc nội tiếp đường trũn thỡ tổng của hai gúc đối diện của nú bằng 180°”. Tỡm mệnh đề đảo của mệnh đề trờn? A. Nếu một tứ giỏc nội tiếp đường trũn thỡ tổng của hai gúc đối diện của nú bằng 90°. B. Nếu tổng hai gúc đối diện của một tứ giỏc bằng 180° thỡ tứ giỏc đú nội tiếp đường trũn. C. Nếu một tứ giỏc khụng nội tiếp đường trũn thỡ tổng của hai gúc đối diện của nú bằng 180°. D. Nếu một tứ giỏc nội tiếp đường trũn thỡ tổng của hai gúc đối diện của nú khụng bằng 180°.",
      "Cõu 2: Cho mệnh đề: “Nếu tứ giỏc là hỡnh chữ nhật thỡ tứ giỏc đú cú hai đường chộo bằng nhau”. Tỡm mệnh đề đảo của mệnh đề trờn? A. Nếu tứ giỏc là hỡnh vuụng thỡ tứ giỏc đú cú hai đường chộo bằng nhau. B. Nếu tứ giỏc là hỡnh chữ nhật thỡ tứ giỏc đú khụng cú hai đường chộo bằng nhau. Liờn hệ tài liệu word toỏn SĐT và zalo: 039.373.2038 C. Nếu một tứ giỏc cú hai đường chộo bằng nhau thỡ tứ giỏc đú là hỡnh chữ nhật. D. Nếu một tứ giỏc cú hai đường chộo bằng nhau thỡ tứ giỏc đú là hỡnh vuụng.",
      "Cõu 3: Cho mệnh đề: “Nếu một tam giỏc là tam giỏc đều thỡ tam giỏc đú cú ba đường phõn giỏc bằng nhau”. Tỡm mệnh đề đảo của mệnh đề trờn? A. Nếu một tam giỏc cú ba đường phõn giỏc bằng nhau thỡ tam giỏc đú là tam giỏc đều. B. Nếu một tam giỏc là tam giỏc đều thỡ tam giỏc đú cú ba đường phõn giỏc khụng bằng nhau. C. Một tam giỏc cú ba đường phõn giỏc bằng nhau. D. Nếu một tam giỏc khụng phải là tam giỏc đều thỡ tam giỏc đú cú ba đường phõn giỏc bằng nhau.",
    ].join("\n"),
  },
]);
assert(String(math10ConverseImport.items[0]?.correctAnswer || "") === "B", "Math 10 converse solver should swap hypothesis and conclusion.");
assert(String(math10ConverseImport.items[1]?.correctAnswer || "") === "C", "Math 10 converse solver should ignore source-contact noise between choices.");
assert(String(math10ConverseImport.items[2]?.correctAnswer || "") === "A", "Math 10 converse solver should handle short OCR geometry statements.");
assert(math10ConverseImport.items.every((question) => question.metadata?.generatedSolutionKind === "logic_converse_statement_solver"), "Math 10 converse items should use the converse solver.");
const math10AutoSolutionGuard = buildMath10ContentGuardReport([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Trong cac cau sau, co bao nhieu cau la menh de?",
      "Co len, sap doi roi!",
      "So 15 la so nguyen to.",
      "Tong cac goc cua mot tam giac la 180 do.",
      "So nguyen duong la so tu nhien khac 0.",
      "A. 3. B. 2. C. 4. D. 1.",
    ].join("\n"),
  },
], { generatedAt: "2026-06-08T00:00:00.000Z" });
assert(math10AutoSolutionGuard.report.stats.generatedSolutions === 1, "Math 10 guard should count generated MiuMath solutions.");
assert(math10AutoSolutionGuard.report.stats.scoredPracticeReady === 1, "Math 10 guard should allow high-confidence generated solutions into scored practice.");
const math10OpenSentenceImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Voi gia tri nao cua bien x thi menh de chua bien P(x): \"x^2 - 3x + 2 = 0\" tro thanh mot menh de dung? A. 0. B. 1. C. -1. D. -2.",
      "Cau 2: Menh de chua bien \"x^3 - 3x^2 + 2x = 0\" dung voi gia tri cua x la bao nhieu? A. x = 0, x = 2. B. x = 0, x = 3. C. x = 0, x = 2, x = 3. D. x = 0, x = 1, x = 2.",
      "Cau 3: Cap gia tri x, y nao duoi day de menh de P: \"2x + y = 10\" la menh de dung? A. x = 0, y = -10. B. x = 10, y = 0. C. x = 5, y = 0. D. x = 4, y = 3.",
      "Cau 4: Cap gia tri x, y nao duoi day de menh de P: \"x + y = 10\" la menh de sai? A. x = 0, y = 10. B. x = 10, y = 0. C. x = 8, y = 1. D. x = 4, y = 6.",
      "Cau 5: Cho hai menh de P va Q. Tim dieu kien de menh de P => Q sai. A. P dung va Q dung. B. P sai va Q dung. C. P dung va Q sai. D. P sai va Q sai.",
    ].join("\n"),
  },
]);
assert(String(math10OpenSentenceImport.items[0]?.correctAnswer || "") === "B", "Math 10 open-sentence solver should test a single x value.");
assert(String(math10OpenSentenceImport.items[1]?.correctAnswer || "") === "D", "Math 10 open-sentence solver should choose the full candidate solution set.");
assert(String(math10OpenSentenceImport.items[2]?.correctAnswer || "") === "C", "Math 10 open-sentence solver should test x/y assignments.");
assert(String(math10OpenSentenceImport.items[3]?.correctAnswer || "") === "C", "Math 10 open-sentence solver should handle false target prompts.");
assert(String(math10OpenSentenceImport.items[4]?.correctAnswer || "") === "C", "Math 10 implication solver should use the truth-table false case.");

const math10LogicTransformImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B1_Menh De.pdf",
    relativePath: "D10_C1_B1_Menh De.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Tim menh de phu dinh cua menh de P: 2 <= 2. A. P: 2 < 2. B. P: 2 > 2. C. P: 2 >= 2. D. P: 2 != 2.",
      "Cau 2: Phu dinh cua menh de: \"Doi la mot loai chim\" la menh de nao sau day? A. Doi la mot loai co canh. B. Chim cung loai voi doi. C. Doi la mot loai an trai cay. D. Doi khong phai la mot loai chim.",
      "Cau 3: Cho menh de: \"Neu mot tu giac noi tiep duong tron thi tong cua hai goc doi dien cua no bang 180°\". Tim menh de dao cua menh de tren? A. Neu mot tu giac noi tiep duong tron thi tong hai goc doi dien bang 90°. B. Neu tong hai goc doi dien cua mot tu giac bang 180° thi tu giac do noi tiep duong tron. C. Neu mot tu giac khong noi tiep duong tron thi tong hai goc doi dien bang 180°. D. Neu mot tu giac noi tiep duong tron thi tong hai goc doi dien khong bang 180°.",
      "Cau 4: Viet menh de sau bang cach su dung ki hieu ∀ hoac ∃: \"Voi moi so thuc thi binh phuong cua no luon lon hon hoac bang 0\". A. ∀x ∈ ℝ, x^2 >= 0. B. ∀x ∈ ℤ, x^2 >= 0. C. ∃x ∈ ℝ, x^2 >= 0. D. ∃x ∈ ℝ, x^2 <= 0.",
      "Cau 5: Viet menh de sau bang cach su dung ki hieu ∀ hoac ∃: \"Co mot so nguyen bang binh phuong cua chinh no\". A. ∀x ∈ ℝ, x = x^2. B. ∀x ∈ ℤ, x^2 = x. C. ∃x ∈ ℤ, x = x^2. D. ∃x ∈ ℝ, x^2 - x = 0.",
      "Cau 6: Viet menh de sau bang cach su dung ki hieu ∀ hoac ∃: \"Tren tap so thuc, phep nhan co tinh phan phoi voi phep cong\". A. ∀x, y, z ∈ ℝ: x. (y + z) = x. y + x. z. B. ∀x ∈ ℝ, ∃y, z ∈ ℝ: x. (y + z) = x. y + x. z. C. ∃x, y, z ∈ ℝ: x. (y + z) = x. y + x. z. D. ∃x ∈ ℝ, ∀y, z ∈ ℝ: x. (y + z) = x. y + x. z.",
      "Cau 7: Viet menh de sau bang cach su dung ki hieu ∀ hoac ∃: \"Cho hai so thuc khac nhau bat ki, luon ton tai mot so huu ti nam giua hai so thuc da cho\". A. ∀a, b ∈ ℝ, a < b, ∃r ∈ ℚ: a < r < b. B. ∀a, b ∈ ℝ, a < b, ∀r ∈ ℚ: a < r < b. C. ∃a, b ∈ ℝ, ∀r ∈ ℚ: a < b < r. D. ∃a, b ∈ ℝ, ∀r ∈ ℚ: a < r < b.",
      "Cau 8: Chon phuong an tra loi dung. Menh de \"∀x ∈ ℝ: x^2 - 4x + 3 = 0\" khang dinh rang: A. Moi so thuc x deu la nghiem cua phuong trinh x^2 - 4x + 3 = 0. B. Co it nhat mot so thuc x la nghiem cua phuong trinh x^2 - 4x + 3 = 0. C. Co duy nhat mot so thuc x la nghiem cua phuong trinh x^2 - 4x + 3 = 0. D. Neu x la mot so thuc thi x^2 - 4x + 3 = 0.",
      "Cau 9: Cho menh de \"∃x ∈ ℝ: x > x^2\". Khang dinh nao dung? A. Co mot so thuc lon hon hoac bang binh phuong cua no. B. Co mot so thuc lon hon binh phuong cua no. C. Binh phuong cua mot so thuc lon hon no. D. Cac so thuc deu lon hon binh phuong cua no.",
      "Cau 10: Cho menh de P(x): \"∀x ∈ ℝ, x^2 + x + 1 > 0\". Menh de phu dinh cua P(x) la: A. ∀x ∈ ℝ, x^2 + x + 1 < 0. B. ∀x ∈ ℝ, x^2 + x + 1 <= 0. C. ∃x ∈ ℝ, x^2 + x + 1 <= 0. D. ∃x ∈ ℝ, x^2 + x + 1 > 0.",
      "Cau 11: Menh de phu dinh cua menh de A: \"∃n ∈ ℕ: n2 = n\" la: A. ∀n ∈ ℕ: n2 != n. B. ∃n ∈ ℕ: n2 != n. C. ∀n ∈ ℕ: n2 = n. D. ∃n ∈ ℚ: n2 = n.",
      "Cau 12: Menh de phu dinh cua menh de A: \"∀x ∈ ℕ: x chia het cho 3\" la: A. ∃x ∈ ℕ: x khong chia het cho 3. B. ∀x ∈ ℕ: x khong chia het cho 3. C. ∃x ∈ ℕ: x chia het cho 3. D. ∀x ∈ ℤ: x khong chia het cho 3.",
    ].join("\n"),
  },
]);
assert(String(math10LogicTransformImport.items[0]?.correctAnswer || "") === "B", "Math 10 logic transform solver should negate <= as >.");
assert(String(math10LogicTransformImport.items[1]?.correctAnswer || "") === "D", "Math 10 logic transform solver should negate simple declarative statements.");
assert(String(math10LogicTransformImport.items[2]?.correctAnswer || "") === "B", "Math 10 logic transform solver should form converse statements.");
assert(String(math10LogicTransformImport.items[3]?.correctAnswer || "") === "A", "Math 10 quantifier solver should translate universal real-square statements.");
assert(String(math10LogicTransformImport.items[4]?.correctAnswer || "") === "C", "Math 10 quantifier solver should translate existential integer statements.");
assert(String(math10LogicTransformImport.items[5]?.correctAnswer || "") === "A", "Math 10 quantifier solver should translate distributive property statements.");
assert(String(math10LogicTransformImport.items[6]?.correctAnswer || "") === "A", "Math 10 quantifier solver should translate nested density statements.");
assert(String(math10LogicTransformImport.items[7]?.correctAnswer || "") === "A", "Math 10 quantifier solver should read universal equation meaning.");
assert(String(math10LogicTransformImport.items[8]?.correctAnswer || "") === "B", "Math 10 quantifier solver should read existential inequality meaning.");
assert(String(math10LogicTransformImport.items[9]?.correctAnswer || "") === "C", "Math 10 quantifier negation solver should negate universal inequalities.");
assert(String(math10LogicTransformImport.items[10]?.correctAnswer || "") === "A", "Math 10 quantifier negation solver should negate existential equalities.");
assert(String(math10LogicTransformImport.items[11]?.correctAnswer || "") === "A", "Math 10 quantifier negation solver should negate universal divisibility.");

const math10FiniteSetImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C1_B2_Tap Hop.pdf",
    relativePath: "D10_C1_B2_Tap Hop.pdf",
    extension: "pdf",
    text: [
      "Cau 1. Tap A = {0;2;4;6} co bao nhieu tap hop con co dung hai phan tu? A. 4. B. 6. C. 7. D. 8.",
      "Cau 2. Trong cac tap hop sau, tap nao co dung mot tap hop con? A. ∅. B. {1}. C. {1;2;3}. D. {1;2}.",
      "Cau 3. Trong cac tap hop sau, tap nao co dung hai tap hop con? A. {x;y}. B. {x}. C. {x;y;z}. D. {a;x;y}.",
      "Cau 4. Cho hai tap hop A = {1;2;3} va B = {1;2;3;4;5}. Co tat ca bao nhieu tap X thoa A ⊂ X ⊂ B? A. 4. B. 5. C. 6. D. 8.",
      "Cau 5. Cho hai tap hop A = {1;2;5;7} va B = {1;2;3}. Co tat ca bao nhieu tap X thoa X ⊂ A va X ⊂ B? A. 1. B. 2. C. 3. D. 4.",
      "Cau 6. Cho tap hop A = {x ∈ N | x la uoc chung cua 36 va 120}. Hay liet ke cac phan tu cua tap hop A. A. A = {1;2;3;4;6;12}. B. A = {1;2;4;6;8;12}. C. A = {2;4;6;8;10;12}. D. A = {1;36;120}.",
      "Cau 7. Cho tap hop A = {1;2;3}. So tap con khac rong cua A la: A. 6. B. 7. C. 8. D. 9.",
      "Cau 8. Cho tap hop A = {a; b; c; d}. Tim so tap con cua tap A. A. 16. B. 15. C. 12. D. 10.",
      "Cau 9. Cho 2 tap hop S = {1;3;5;8}; T = {3;5;7;9}. Tap hop S hop T bang tap hop nao sau day? A. {3;5}. B. {1;3;5;7;8;9}. C. {1;7;9}. D. {1;3;5}.",
      "Cau 10. Cho hai tap hop A = {2;4;6;9} va B = {1;2;3;4}. Tap hop A \\ B bang tap nao sau day? A. {1;2;3;5}. B. {1;3;6;9}. C. {6;9}. D. ∅.",
      "Cau 11. Cho x la mot phan tu cua tap hop A. Xet cac menh de sau: (I) x thuoc A. (II) {x} thuoc A. (III) x la tap con A. (IV) {x} la tap con A. Trong cac menh de tren, menh de nao dung? A. I va II. B. I va III. C. I va IV. D. II va IV.",
      "Cau 12. Cho ba tap hop E, F va G. Biet E la tap con F, F la tap con G va G la tap con E. Khang dinh nao sau day dung? A. E != F. B. F != G. C. E != G. D. E = F = G.",
      "Cau 13. Trong cac tap hop sau, tap nao la tap rong? A. { x ∈ N | x^2 + 4x = 0}. B. { x ∈ Q | x^2 - x - 20 = 0}. C. { x ∈ R | x^2 - 2x + 3 = 0}. D. { x ∈ R | 2x^2 - 5 = 0}.",
      "Cau 14. Trong cac tap hop sau, tap nao khac rong? A. { x ∈ R | x^2 + 2x + 15 = 0}. B. { x ∈ R | x^2(x^2 + 3) = 0}. C. { x ∈ Z | (x^2 - 2)(x^2 + 4) = 0}. D. { x ∈ Q | 2x^2 - 6 = 0}.",
    ].join("\n"),
  },
]);
assert(String(math10FiniteSetImport.items[0]?.correctAnswer || "") === "B", "Math 10 finite-set solver should count subsets with exact size.");
assert(String(math10FiniteSetImport.items[1]?.correctAnswer || "") === "A", "Math 10 finite-set solver should identify the set with one subset.");
assert(String(math10FiniteSetImport.items[2]?.correctAnswer || "") === "B", "Math 10 finite-set solver should identify the set with two subsets.");
assert(String(math10FiniteSetImport.items[3]?.correctAnswer || "") === "A", "Math 10 finite-set solver should count sets between finite A and B.");
assert(String(math10FiniteSetImport.items[4]?.correctAnswer || "") === "D", "Math 10 finite-set solver should count common subsets via intersection.");
assert(String(math10FiniteSetImport.items[5]?.correctAnswer || "") === "A", "Math 10 finite-set solver should list common divisors as a set.");
assert(String(math10FiniteSetImport.items[6]?.correctAnswer || "") === "B", "Math 10 finite-set solver should count nonempty subsets.");
assert(String(math10FiniteSetImport.items[7]?.correctAnswer || "") === "A", "Math 10 finite-set solver should count all subsets.");
assert(String(math10FiniteSetImport.items[8]?.correctAnswer || "") === "B", "Math 10 finite-set solver should compute finite unions.");
assert(String(math10FiniteSetImport.items[9]?.correctAnswer || "") === "C", "Math 10 finite-set solver should compute finite differences.");
assert(String(math10FiniteSetImport.items[10]?.correctAnswer || "") === "C", "Math 10 finite-set solver should handle singleton subset relations.");
assert(String(math10FiniteSetImport.items[11]?.correctAnswer || "") === "D", "Math 10 finite-set solver should infer equality from mutual inclusion.");
assert(String(math10FiniteSetImport.items[12]?.correctAnswer || "") === "C", "Math 10 set-builder solver should identify an empty real quadratic set.");
assert(String(math10FiniteSetImport.items[13]?.correctAnswer || "") === "B", "Math 10 set-builder solver should identify a nonempty product-equation set.");

const math10VectorIdentityImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "H10_C1_B2_tong va hieu cua hai vec to.pdf",
    relativePath: "H10_C1_B2_tong va hieu cua hai vec to.pdf",
    extension: "pdf",
    text: [
          "Cau 1. Cho 4 diem bat ky A, B, C, O. Dang thuc nao sau day dung? A. OA = CA + OC. B. AB = AC + BC. C. AB = OB + OA. D. OA = OB + AB.",
      "Cau 2. Cho ba diem phan biet A, B, C. Dang thuc nao sau day dung? A. AB - BC = CA. B. AB + CA = CB. C. CA - BA = BC. D. AB + AC = BC.",
      "Cau 3. Cho ba diem A, B, C phan biet. Dang thuc nao sau day sai? A. AB + BC = AC. B. CA + AB = BC. C. BA + AC = BC. D. AB - AC = CB.",
    ].join("\n"),
  },
]);
assert(String(math10VectorIdentityImport.items[0]?.correctAnswer || "") === "A", "Math 10 vector identity solver should choose the true Chasles identity.");
assert(String(math10VectorIdentityImport.items[1]?.correctAnswer || "") === "B", "Math 10 vector identity solver should reduce signed vector sums.");
assert(String(math10VectorIdentityImport.items[2]?.correctAnswer || "") === "B", "Math 10 vector identity solver should identify the false vector equality.");

const math10OxyLineImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "H10_C3_B1_phuong phap toa do trong mat phang.pdf",
    relativePath: "H10_C3_B1_phuong phap toa do trong mat phang.pdf",
    extension: "pdf",
    text: [
      "Cau 1. Phuong trinh tong quat cua duong thang di qua hai diem A(-2;4), B(1;0) la A. 4x + 3y + 4 = 0. B. 4x + 3y - 4 = 0. C. 4x - 3y + 4 = 0. D. 4x - 3y - 4 = 0.",
      "Cau 2. Cho hai diem A(1;-4) va B(3;2). Viet phuong trinh tong quat cua duong thang trung truc cua doan AB. A. x + 3y + 1 = 0. B. 3x + y + 1 = 0. C. x - y + 4 = 0. D. x + y - 1 = 0.",
      "Cau 3. Tim toa do giao diem cua duong thang Delta: 5x + 2y - 10 = 0 va truc hoanh Ox. A. (0;2). B. (0;5). C. (2;0). D. (-2;0).",
      "Cau 4. Tim toa do diem M nam tren truc Ox va cach deu hai duong thang d1: 3x - 2y - 6 = 0 va d2: 3x - 2y + 3 = 0. A. (0;2). B. (0.5;0). C. (1;0). D. (2;0).",
      "Cau 5. Duong thang d di qua diem M(1;2) va song song voi duong thang Delta: 2x + 3y - 12 = 0 co phuong trinh tong quat la: A. 2x + 3y - 8 = 0. B. 2x + 3y + 8 = 0. C. 4x + 6y + 1 = 0. D. 4x - 3y - 8 = 0.",
      "Cau 6. Viet phuong trinh duong thang qua M(-2;-5) va song song voi duong phan giac goc phan tu thu nhat. A. x + y - 3 = 0. B. x - y - 3 = 0. C. x + y + 3 = 0. D. 2x - y - 1 = 0.",
    ].join("\n"),
  },
]);
assert(String(math10OxyLineImport.items[0]?.correctAnswer || "") === "B", "Math 10 Oxy solver should choose a line through two points.");
assert(String(math10OxyLineImport.items[1]?.correctAnswer || "") === "A", "Math 10 Oxy solver should choose a perpendicular bisector equation.");
assert(String(math10OxyLineImport.items[2]?.correctAnswer || "") === "C", "Math 10 Oxy solver should find x-axis intersections.");
assert(!math10OxyLineImport.items[3]?.correctAnswer, "Math 10 Oxy solver should not treat an Ox equidistance prompt as an axis-intersection prompt.");
assert(String(math10OxyLineImport.items[4]?.correctAnswer || "") === "A", "Math 10 Oxy solver should choose a line through a point parallel to a given line.");
assert(String(math10OxyLineImport.items[5]?.correctAnswer || "") === "B", "Math 10 Oxy solver should choose a line parallel to the first-quadrant angle bisector.");

const math10OxyDistanceImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "H10_C2_B3_tich voi huong vecto.pdf",
    relativePath: "H10_C2_B3_tich voi huong vecto.pdf",
    extension: "pdf",
    text: [
      "Cau 1. Trong mat phang toa do Oxy, tinh khoang cach giua hai diem M(1;-2) va N(-3;4). A. MN = 4. B. MN = 6. C. MN = 3 6. D. MN = 2 13.",
      "Cau 2. Trong mat phang toa do Oxy, tim diem M thuoc truc hoanh de khoang cach tu do den diem N(-1;4) bang 2 5. A. M(1;0). B. M(1;0), M(-3;0). C. M(3;0). D. M(1;0), M(3;0).",
    ].join("\n"),
  },
]);
assert(String(math10OxyDistanceImport.items[0]?.correctAnswer || "") === "D", "Math 10 Oxy distance solver should parse OCR-lost radicals such as 2 13.");
assert(String(math10OxyDistanceImport.items[0]?.metadata?.generatedSolutionKind || "") === "oxy_two_point_distance_solver", "Math 10 Oxy distance item should use the distance solver.");
assert(String(math10OxyDistanceImport.items[1]?.correctAnswer || "") === "B", "Math 10 Oxy axis-distance solver should keep both symmetric points on the axis.");
assert(String(math10OxyDistanceImport.items[1]?.metadata?.generatedSolutionKind || "") === "oxy_axis_distance_point_solver", "Math 10 Oxy axis-distance item should use the axis-distance solver.");

const math10InequalityFormImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C4_B4_BAT PHUONG TRINH BAC NHAT HAI AN.pdf",
    relativePath: "D10_C4_B4_BAT PHUONG TRINH BAC NHAT HAI AN.pdf",
    extension: "pdf",
    text: [
      "Cau 1. Bat phuong trinh nao sau day la bat phuong trinh bac nhat hai an? A. 2x^2 + 3y > 0. B. x^2 + y^2 < 2. C. x + y^2 >= 0. D. x + y >= 0.",
      "Cau 2. Bat phuong nao sau day la bat phuong trinh bac nhat hai an? A. 3x^2 + 2x - 4 > 0. B. 2x < 3y - 5. C. 2x^2 + 5y > 3. D. 2x <= 5y + 3z.",
      "Cau 3. Voi gia tri nao cua tham so m thi bat phuong trinh (m^2 - 1)x + (2 - 2m)y > 2 la bat phuong trinh bac nhat hai an? A. m != 1. B. m != +-1. C. m = 1. D. m = -1.",
    ].join("\n"),
  },
]);
assert(String(math10InequalityFormImport.items[0]?.correctAnswer || "") === "D", "Math 10 inequality form solver should reject squared terms.");
assert(String(math10InequalityFormImport.items[1]?.correctAnswer || "") === "B", "Math 10 inequality form solver should reject third variables.");
assert(!math10InequalityFormImport.items[2]?.correctAnswer, "Math 10 inequality form solver should skip parameter-condition prompts.");

const math10InequalityPointImport = buildMath10QuestionItemsFromRawSources([
  {
    fileName: "D10_C4_B4_BAT PHUONG TRINH BAC NHAT HAI AN.pdf",
    relativePath: "D10_C4_B4_BAT PHUONG TRINH BAC NHAT HAI AN.pdf",
    extension: "pdf",
    text: [
      "Cau 1: Mien nghiem cua bat phuong trinh 5x - 2y + 1 > 3(x + y - 1) la nua mat phang chua diem co toa do nao? A. (0;2). B. (-1;1). C. (1;-4). D. (2;2).",
      "Cau 2: Diem nao duoi day thuoc mien nghiem cua he bat phuong trinh x + 2y - 1 >= 0 va 3x + 2y + 1 <= 0? A. (-1;1). B. (0;1). C. (-1;0). D. (1;3).",
      "Cau 3: Diem nao thuoc mien nghiem cua he bat phuong trinh 2x + y + 5 > 0 va x + y + 1 < 0? A. (0;0). B. (1;0). C. (0;-2). D. (0;2). { x/2 + y/3 >= 1 }",
    ].join("\n"),
  },
]);
assert(String(math10InequalityPointImport.items[0]?.correctAnswer || "") === "C", "Math 10 inequality solver should test a point in a half-plane.");
assert(String(math10InequalityPointImport.items[1]?.correctAnswer || "") === "A", "Math 10 inequality solver should test a point in an inequality system.");
assert(!math10InequalityPointImport.items[2]?.correctAnswer, "Math 10 inequality solver should skip prompts with trailing OCR inequalities inside answer text.");

const math9FormulaGuard = buildMath9ContentGuardReport([
  {
    fileName: "thuvienhoclieu.com-CHUYEN-DE-3-CAC-PHEP-BIEN-DOI-BIEU-THUC-CHUA-CAN.docx",
    relativePath: "thuvienhoclieu.com-CHUYEN-DE-3-CAC-PHEP-BIEN-DOI-BIEU-THUC-CHUA-CAN.docx",
    extension: "docx",
    text: "Cau 1: Rut gon bieu thuc {{formula:/assets/math9/formulas/sample/formula0001.png|w=80|h=24}}.",
    richExtraction: true,
    rawOleMarkerCount: 1,
    formulaAssetCount: 1,
  },
], {
  generatedAt: "2026-06-05T00:00:00.000Z",
  formulaAssetExists: () => true,
});
assert(math9FormulaGuard.report.sourceQuality.length === 1, "Math 9 guard should report per-source quality.");
assert(math9FormulaGuard.report.sourceQuality[0]?.formulaRecoveryGap === 0, "Math 9 guard should not flag recovered formula markers.");
assert(math9FormulaGuard.report.adapter.pass, "Math 9 guard output should validate as standard QuestionItems.");

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

// Math 7 Tests
assert(MATH7_LEARNING_MATRIX.length >= 10, "Math 7 matrix should expose the full 10 topics.");
assert(MATH7_LEARNING_MATRIX.every((topic) => topic.grade === 7), "Every Math 7 topic should be grade 7.");
assert(MATH7_LEARNING_MATRIX.every((topic) => topic.patterns.length > 0), "Every Math 7 topic should define patterns.");
assert(MATH7_ACCESS_INDEX.grade["7"].length === MATH7_LEARNING_MATRIX.length, "Math 7 access index should expose every topic by grade.");

// Math 8 Tests
assert(MATH8_LEARNING_MATRIX.length >= 10, "Math 8 matrix should expose the full 10 topics.");
assert(MATH8_LEARNING_MATRIX.every((topic) => topic.grade === 8), "Every Math 8 topic should be grade 8.");
assert(MATH8_LEARNING_MATRIX.every((topic) => topic.patterns.length > 0), "Every Math 8 topic should define patterns.");
assert(MATH8_ACCESS_INDEX.grade["8"].length === MATH8_LEARNING_MATRIX.length, "Math 8 access index should expose every topic by grade.");
