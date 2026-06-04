import * as mocks from './mocks';
import type { EnglishExamQuestion, EnglishExamQuestionGroup, EnglishExamSection, EnglishExamTest } from './standard';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string; exitCode?: number };

const fs = require('node:fs');
const path = require('node:path');

type DeepIssueSeverity = 'blocker' | 'warning' | 'enhancement';
type AuditRecordKind = 'question' | 'writing_sample' | 'speaking_sample';

interface DeepIssue {
  severity: DeepIssueSeverity;
  code: string;
  kind: AuditRecordKind;
  exam: 'ielts' | 'cpe';
  skill: string;
  testId: string;
  testTitle: string;
  sourceFile: string;
  sectionId: string;
  sectionTitle: string;
  groupId: string;
  questionId: string;
  questionType: string;
  field: string;
  message: string;
  excerpt: string;
  recommendation: string;
}

interface AuditContext {
  kind: AuditRecordKind;
  exam: 'ielts' | 'cpe';
  skill: string;
  testId: string;
  testTitle: string;
  sourceFile: string;
  sectionId: string;
  sectionTitle: string;
  groupId: string;
  questionId: string;
  questionType: string;
}

const outputDir = getArgValue('--outDir') || path.resolve(process.cwd(), '..', '..', 'reports', 'content-quality', 'ielts-cpe-deep-audit');
fs.mkdirSync(outputDir, { recursive: true });

const sourceFilesByTestId = buildSourceFileLookup();
const tests = dedupeEnglishExamTests((Object.values(mocks) as unknown[]).filter(isEnglishExamTest)).filter(isIeltsOrCpeTest);
const issues = [
  ...auditExamTests(tests),
  ...auditFeedbackSamples(),
].sort(compareIssues);

const summary = buildSummary(tests, issues);
const jsonPath = path.join(outputDir, 'ielts-cpe-deep-audit.json');
const csvPath = path.join(outputDir, 'ielts-cpe-deep-audit.csv');
const markdownPath = path.join(outputDir, 'ielts-cpe-deep-audit.md');

fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), summary, issues }, null, 2));
fs.writeFileSync(csvPath, toCsv(issues));
fs.writeFileSync(markdownPath, toMarkdown(summary, issues));

console.log(JSON.stringify({ outputDir, jsonPath, csvPath, markdownPath, summary }, null, 2));

function auditExamTests(testsToAudit: EnglishExamTest[]): DeepIssue[] {
  const allIssues: DeepIssue[] = [];
  for (const test of testsToAudit) {
    const exam = inferExam(test);
    if (!exam) continue;
    for (const section of test.sections || []) {
      for (const group of section.questionGroups || []) {
        for (const question of group.questions || []) {
          allIssues.push(...auditQuestion(test, section, group, question, exam));
        }
      }
    }
  }
  return allIssues;
}

function dedupeEnglishExamTests(testsToDedupe: EnglishExamTest[]): EnglishExamTest[] {
  const seen = new Set<string>();
  return testsToDedupe.filter((test) => {
    const key = String(test.id || '').trim();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function auditQuestion(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
  exam: 'ielts' | 'cpe',
): DeepIssue[] {
  const context: AuditContext = {
    kind: 'question',
    exam,
    skill: inferSkill(test, section, question),
    testId: String(test.id || ''),
    testTitle: String(test.title || ''),
    sourceFile: sourceFilesByTestId[String(test.id || '')] || '',
    sectionId: String(section.id || ''),
    sectionTitle: String(section.title || ''),
    groupId: String(group.id || ''),
    questionId: String(question.id || ''),
    questionType: String(question.type || ''),
  };
  const issues: DeepIssue[] = [];
  const sectionSource = plainText([section.passageHtml, section.transcript].filter(Boolean).join(' '));
  const visiblePrompt = plainText([section.instructions, group.instruction, question.instruction, question.passageHtml].filter(Boolean).join(' '));
  const correctAnswer = normalizeAnswer(question.correctAnswer ?? question.acceptedAnswers?.[0]?.[0] ?? '');
  const acceptedAnswers = flattenAcceptedAnswers(question.acceptedAnswers);
  const explanation = plainText(question.explanation || '');
  const answerLocation = plainText(question.answerLocation || '');

  addTextQualityIssues(issues, context, 'instruction', visiblePrompt, {
    minLength: isCompactCambridgeGap(question) ? 6 : 20,
    required: true,
    recommendation: 'Bổ sung hướng dẫn rõ ràng để học viên hiểu đang cần chọn/điền/ghép gì.',
  });
  addTextQualityIssues(issues, context, 'explanation', explanation, {
    minLength: minExplanationLength(context, question),
    required: true,
    recommendation: 'Viết lại explanation theo công thức: vì sao đúng, vì sao đáp án nhiễu sai, dấu hiệu trong bài, lỗi học viên dễ mắc.',
  });
  addTextQualityIssues(issues, context, 'answerLocation', answerLocation, {
    minLength: context.skill === 'use_of_english' ? 2 : 8,
    required: context.skill === 'reading' || context.skill === 'listening',
    recommendation: 'Thêm câu/đoạn bằng chứng trong passage/transcript để học viên tra ngược lại nguồn.',
  });

  for (const [field, value] of Object.entries({
    sectionTitle: section.title,
    groupInstruction: group.instruction,
    questionInstruction: question.instruction,
    passageHtml: section.passageHtml || question.passageHtml || '',
    transcript: section.transcript || '',
    explanation: question.explanation || '',
    answerLocation: question.answerLocation || '',
    correctAnswer: String(question.correctAnswer ?? ''),
    acceptedAnswers: acceptedAnswers.join(' | '),
    options: normalizeOptions(question.options).map((option) => option.raw).join(' | '),
  })) {
    addPresentationIssues(issues, context, field, String(value || ''), {
      allowTrailingConnector: (field === 'questionInstruction' && question.type === 'multiple_choice' && normalizeOptions(question.options).length > 1) || field === 'acceptedAnswers',
    });
  }

  if (shouldRequireSourceEvidence(context, question, answerLocation) && sectionSource && !containsEvidence(sectionSource, answerLocation)) {
    issues.push(issue(context, 'warning', 'answer_location_not_found_in_source', 'answerLocation', 'Không tìm thấy answerLocation trong passage/transcript theo kiểm tra text-match.', answerLocation, 'Rà lại answerLocation: nên copy đúng cụm/câu nguồn hoặc sửa để khớp transcript/passage.'));
  }

  if (!acceptedAnswers.length) {
    issues.push(issue(context, 'blocker', 'missing_accepted_answers', 'acceptedAnswers', 'Câu hỏi chưa có acceptedAnswers.', '', 'Thêm acceptedAnswers để chấm và mastery tracking hoạt động.'));
  }
  if (!correctAnswer && !acceptedAnswers.length) {
    issues.push(issue(context, 'blocker', 'missing_correct_answer', 'correctAnswer', 'Câu hỏi chưa có correctAnswer hoặc acceptedAnswers.', '', 'Thêm đáp án chuẩn trước khi đưa vào luyện tập.'));
  }
  if (correctAnswer && acceptedAnswers.length && !acceptedAnswers.some((answer) => sameAnswer(answer, correctAnswer))) {
    issues.push(issue(context, 'warning', 'correct_answer_not_in_accepted_answers', 'correctAnswer', 'correctAnswer không nằm trong acceptedAnswers.', String(question.correctAnswer ?? ''), 'Đồng bộ correctAnswer và acceptedAnswers để tránh chấm lệch.'));
  }

  if (question.type === 'multiple_choice') {
    auditMultipleChoice(issues, context, question, explanation, answerLocation);
  }
  if ((question.type === 'gap_fill' || question.type === 'table_completion') && acceptedAnswers.length) {
    auditGapFill(issues, context, question, explanation);
  }
  if ((question.type === 'gapped_text' || question.type === 'multiple_matching') && !Array.isArray(question.options)) {
    issues.push(issue(context, 'blocker', 'missing_matching_options', 'options', `${question.type} cần danh sách options để hiển thị đầy đủ.`, '', 'Bổ sung options/paragraph choices đầy đủ.'));
  }

  if (explanation && !hasPedagogicalDepth(explanation, question)) {
    issues.push(issue(context, 'enhancement', 'explanation_missing_trap_or_method', 'explanation', 'Explanation chưa chỉ rõ bẫy, đáp án nhiễu, mẹo làm bài hoặc tri thức ngôn ngữ cần dùng.', explanation, 'Bổ sung một câu “Trap/Method”: dấu hiệu chọn đáp án, vì sao đáp án nhiễu sai, collocation/grammar/paraphrase liên quan.'));
  }
  if (context.skill === 'use_of_english' && explanation && !hasLanguageKnowledgeCue(explanation)) {
    issues.push(issue(context, 'enhancement', 'uoe_explanation_missing_language_rule', 'explanation', 'Use of English explanation chưa nêu rõ rule/collocation/word form/pattern.', explanation, 'Bổ sung rule ngôn ngữ cụ thể: collocation, dependent preposition, word form, tense/aspect, clause pattern hoặc idiom.'));
  }

  return issues;
}

function auditMultipleChoice(issues: DeepIssue[], context: AuditContext, question: EnglishExamQuestion, explanation: string, answerLocation: string) {
  const options = normalizeOptions(question.options);
  if (options.length < 2) {
    issues.push(issue(context, 'blocker', 'missing_or_short_options', 'options', 'Multiple choice cần ít nhất 2 options.', '', 'Bổ sung đầy đủ options hiển thị cho học viên.'));
    return;
  }
  const correctAnswer = normalizeAnswer(question.correctAnswer ?? question.acceptedAnswers?.[0]?.[0] ?? '');
  const optionKeys = options.map((option) => normalizeAnswer(option.key)).filter(Boolean);
  if (correctAnswer && /^[a-z]$/i.test(correctAnswer) && !optionKeys.some((key) => sameAnswer(key, correctAnswer))) {
    issues.push(issue(context, 'blocker', 'correct_option_key_missing', 'correctAnswer', 'Đáp án chữ cái không tồn tại trong options.', String(question.correctAnswer ?? ''), 'Sửa correctAnswer hoặc options để key khớp A/B/C/D.'));
  }
  const correctOption = options.find((option) => sameAnswer(option.key, correctAnswer));
  const explanationAnswerLetter = extractExplanationAnswerLetter(explanation);
  if (correctAnswer && explanationAnswerLetter && !sameAnswer(explanationAnswerLetter, correctAnswer)) {
    issues.push(issue(context, 'warning', 'explanation_correct_letter_mismatch', 'explanation', 'Explanation nêu chữ đáp án khác với correctAnswer.', explanation, 'Đồng bộ lại explanation với correctAnswer để tránh học viên học sai đáp án.'));
  }
  if (correctOption && explanation && !textMentions(explanation, correctOption.text) && !textMentions(explanation, answerLocation)) {
    issues.push(issue(context, 'warning', 'explanation_does_not_reference_correct_option', 'explanation', 'Explanation chưa nhắc rõ nội dung đáp án đúng hoặc bằng chứng nguồn.', explanation, 'Nhắc lại đáp án đúng/ý đúng trong explanation để học viên thấy logic chọn đáp án.'));
  }
  if (options.length >= 4 && explanation && !mentionsDistractors(explanation, options, correctAnswer)) {
    issues.push(issue(context, 'enhancement', 'multiple_choice_missing_distractor_analysis', 'explanation', 'Multiple choice chưa phân tích đáp án nhiễu.', explanation, 'Thêm lý do loại ít nhất 1-2 distractors quan trọng, đặc biệt bẫy từ đồng nghĩa/paraphrase/grammar.'));
  }
}

function auditGapFill(issues: DeepIssue[], context: AuditContext, question: EnglishExamQuestion, explanation: string) {
  if (question.blankIndex !== undefined && (!Number.isFinite(question.blankIndex) || question.blankIndex <= 0)) {
    issues.push(issue(context, 'warning', 'invalid_blank_index', 'blankIndex', 'blankIndex không phải số dương.', String(question.blankIndex), 'Sửa blankIndex để hỗ trợ UI review và highlight ô trống.'));
  }
  if (explanation && !hasLanguageKnowledgeCue(explanation) && context.skill === 'use_of_english') {
    issues.push(issue(context, 'enhancement', 'gap_fill_missing_form_or_collocation_cue', 'explanation', 'Gap fill chưa chỉ rõ word form/collocation/grammar pattern.', explanation, 'Bổ sung dấu hiệu từ loại, collocation, dependent preposition hoặc cấu trúc cố định.'));
  }
}

function auditFeedbackSamples(): DeepIssue[] {
  const issues: DeepIssue[] = [];
  for (const [exportName, value] of Object.entries(mocks)) {
    if (!Array.isArray(value)) continue;
    const kind = exportName.includes('WRITING') ? 'writing_sample' : exportName.includes('SPEAKING') ? 'speaking_sample' : '';
    if (!kind) continue;
    const exam = exportName.startsWith('IELTS') ? 'ielts' : exportName.startsWith('CPE') ? 'cpe' : '';
    if (!exam) continue;
    const sourceFile = exportName.startsWith('IELTS') ? 'packages/content/src/mocks/ielts-writing-speaking-samples.ts' : 'packages/content/src/mocks/cpe-writing-speaking-samples.ts';
    for (const sample of value as Array<Record<string, unknown>>) {
      const context: AuditContext = {
        kind,
        exam,
        skill: kind === 'writing_sample' ? 'writing' : 'speaking',
        testId: String(sample.id || ''),
        testTitle: String(sample.title || ''),
        sourceFile,
        sectionId: '',
        sectionTitle: '',
        groupId: '',
        questionId: String(sample.id || ''),
        questionType: kind,
      };
      const mainText = kind === 'writing_sample' ? String(sample.sampleAnswer || '') : String(sample.sampleTranscript || '');
      addTextQualityIssues(issues, context, 'prompt', plainText(String(sample.prompt || '')), {
        minLength: 30,
        required: true,
        recommendation: 'Bổ sung đề bài đầy đủ để học viên hiểu task.',
      });
      addTextQualityIssues(issues, context, kind === 'writing_sample' ? 'sampleAnswer' : 'sampleTranscript', plainText(mainText), {
        minLength: kind === 'writing_sample' ? 300 : 180,
        required: true,
        recommendation: 'Bổ sung bài mẫu/transcript đủ dài, có cấu trúc và đủ ý.',
      });
      addPresentationIssues(issues, context, 'prompt', String(sample.prompt || ''));
      addPresentationIssues(issues, context, 'title', String(sample.title || ''));
      addPresentationIssues(issues, context, kind === 'writing_sample' ? 'sampleAnswer' : 'sampleTranscript', mainText);
      for (const [index, entry] of (Array.isArray(sample.outline) ? sample.outline : []).entries()) {
        addPresentationIssues(issues, context, `outline[${index}]`, typeof entry === 'string' ? entry : JSON.stringify(entry));
      }
      for (const [index, entry] of (Array.isArray(sample.collocations) ? sample.collocations : []).entries()) {
        addPresentationIssues(issues, context, `collocations[${index}]`, JSON.stringify(entry));
      }
      for (const [index, entry] of (Array.isArray(sample.lexicalUpgrades) ? sample.lexicalUpgrades : []).entries()) {
        addPresentationIssues(issues, context, `lexicalUpgrades[${index}]`, JSON.stringify(entry));
      }
    }
  }
  return issues;
}

function addTextQualityIssues(
  issues: DeepIssue[],
  context: AuditContext,
  field: string,
  value: string,
  options: { minLength: number; required: boolean; recommendation: string },
) {
  const text = plainText(value);
  if (options.required && !text) {
    issues.push(issue(context, 'blocker', `missing_${field}`, field, `${field} đang thiếu nội dung.`, '', options.recommendation));
    return;
  }
  if (text && text.length < options.minLength) {
    issues.push(issue(context, 'warning', `shallow_${field}`, field, `${field} quá ngắn để hỗ trợ học/sửa lỗi sâu.`, text, options.recommendation));
  }
}

function addPresentationIssues(
  issues: DeepIssue[],
  context: AuditContext,
  field: string,
  rawValue: string,
  options: { allowTrailingConnector?: boolean } = {},
) {
  const value = String(rawValue || '');
  const text = plainText(value);
  if (!text) return;
  if (hasMojibake(value)) {
    issues.push(issue(context, 'warning', 'mojibake_or_encoding_artifact', field, 'Nội dung có dấu hiệu lỗi encoding/mojibake.', text, 'Sửa encoding về Unicode UTF-8 chuẩn; đặc biệt các cụm tiếng Việt hoặc ký hiệu £ bị hiển thị dạng Â/Ã/Ä.'));
  }
  if (/\b(TODO|TBD|FIXME|undefined|lorem ipsum)\b/i.test(text) || /^null$/i.test(text)) {
    issues.push(issue(context, 'blocker', 'placeholder_or_null_text', field, 'Nội dung có placeholder/null/debug text.', text, 'Thay bằng nội dung thật trước khi đưa vào học.'));
  }
  const repeated = text.match(/\b([A-Za-z]{3,})\s+\1\b/i);
  if (repeated) {
    const repeatedText = repeated[0].toLowerCase();
    if (!isAllowedRepeatedWord(repeatedText) && !isHtmlBoundaryRepeat(value, repeated[1])) {
      issues.push(issue(context, 'warning', 'repeated_word', field, `Có từ bị lặp: "${repeated[0]}".`, text, 'Rà chính tả và biên tập câu hiển thị.'));
    }
  }
  if (/<[^>]*$/.test(value) || /&(?:nbsp|amp|lt|gt|quot)(?!;)/i.test(value)) {
    issues.push(issue(context, 'warning', 'broken_html_or_entity', field, 'HTML/entity có dấu hiệu bị ngắt hoặc thiếu dấu chấm phẩy.', text, 'Sửa HTML/entity để UI không hiển thị vỡ.'));
  }
  if (!options.allowTrailingConnector && text.length > 80 && /(?:,\s*|;\s*|\b(?:and|or|but|because|although|while)\s*)$/i.test(text)) {
    issues.push(issue(context, 'warning', 'possibly_truncated_text', field, 'Nội dung có vẻ bị ngắt ở cuối câu.', text, 'Đối chiếu source để hoàn thiện câu/đoạn bị cụt.'));
  }
  const typo = findCommonTypo(text);
  if (typo) {
    issues.push(issue(context, 'warning', 'common_spelling_suspicion', field, `Có từ nghi sai chính tả: "${typo}".`, text, 'Rà chính tả thủ công hoặc thay bằng từ chuẩn.'));
  }
}

function issue(
  context: AuditContext,
  severity: DeepIssueSeverity,
  code: string,
  field: string,
  message: string,
  excerpt: string,
  recommendation: string,
): DeepIssue {
  return {
    ...context,
    severity,
    code,
    field,
    message,
    excerpt: truncate(plainText(excerpt), 220),
    recommendation,
  };
}

function buildSummary(testsToAudit: EnglishExamTest[], issueList: DeepIssue[]) {
  const questionCount = testsToAudit.reduce(
    (sum, test) => sum + (test.sections || []).reduce((sectionSum, section) => sectionSum + (section.questionGroups || []).reduce((groupSum, group) => groupSum + (group.questions || []).length, 0), 0),
    0,
  );
  return {
    tests: testsToAudit.length,
    questions: questionCount,
    issues: issueList.length,
    blockers: issueList.filter((entry) => entry.severity === 'blocker').length,
    warnings: issueList.filter((entry) => entry.severity === 'warning').length,
    enhancements: issueList.filter((entry) => entry.severity === 'enhancement').length,
    affectedQuestions: new Set(issueList.filter((entry) => entry.kind === 'question').map((entry) => questionKey(entry))).size,
    byExam: countBy(issueList.map((entry) => entry.exam)),
    bySkill: countBy(issueList.map((entry) => entry.skill || 'unknown')),
    byCode: countBy(issueList.map((entry) => entry.code)),
    bySeverity: countBy(issueList.map((entry) => entry.severity)),
  };
}

function toCsv(issueList: DeepIssue[]): string {
  const headers = [
    'severity',
    'code',
    'kind',
    'exam',
    'skill',
    'testId',
    'testTitle',
    'sourceFile',
    'sectionId',
    'sectionTitle',
    'groupId',
    'questionId',
    'questionType',
    'field',
    'message',
    'excerpt',
    'recommendation',
  ];
  return [headers, ...issueList.map((entry) => headers.map((header) => (entry as unknown as Record<string, unknown>)[header] || ''))]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
}

function toMarkdown(summary: ReturnType<typeof buildSummary>, issueList: DeepIssue[]): string {
  const lines = [
    '# IELTS/CPE Deep Content Audit',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Tests audited: ${summary.tests}`,
    `- Questions audited: ${summary.questions}`,
    `- Total issues: ${summary.issues}`,
    `- Blockers: ${summary.blockers}`,
    `- Warnings: ${summary.warnings}`,
    `- Enhancements: ${summary.enhancements}`,
    `- Affected questions: ${summary.affectedQuestions}`,
    '',
    '## Top Issue Codes',
    '',
    ...topEntries(summary.byCode, 20).map(([code, count]) => `- ${code}: ${count}`),
    '',
    '## Blockers',
    '',
    ...formatIssues(issueList.filter((entry) => entry.severity === 'blocker').slice(0, 200)),
    '',
    '## Warnings',
    '',
    ...formatIssues(issueList.filter((entry) => entry.severity === 'warning').slice(0, 300)),
    '',
    '## Pedagogical Enhancements',
    '',
    ...formatIssues(issueList.filter((entry) => entry.severity === 'enhancement').slice(0, 300)),
    '',
    'Full machine-readable list is in the JSON and CSV files in this folder.',
  ];
  return `${lines.join('\n')}\n`;
}

function formatIssues(issueList: DeepIssue[]): string[] {
  if (!issueList.length) return ['None.'];
  return issueList.map((entry) => {
    const location = [entry.exam, entry.skill, entry.testId, entry.sectionId, entry.groupId, entry.questionId || entry.testId].filter(Boolean).join(' | ');
    return `- ${entry.code} | ${location} | ${entry.field} | ${entry.message}${entry.excerpt ? ` | ${entry.excerpt}` : ''}`;
  });
}

function buildSourceFileLookup(): Record<string, string> {
  const mocksDir = path.resolve(process.cwd(), 'src', 'mocks');
  const lookup: Record<string, string> = {};
  if (!fs.existsSync(mocksDir)) return lookup;
  const files = fs.readdirSync(mocksDir).filter((file: string) => file.endsWith('.json'));
  for (const file of files) {
    try {
      const fullPath = path.join(mocksDir, file);
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (parsed?.id) lookup[String(parsed.id)] = path.join('packages', 'content', 'src', 'mocks', file).replace(/\\/g, '/');
    } catch {
      // Ignore unreadable files; schema guard handles parse errors elsewhere.
    }
  }
  return lookup;
}

function isEnglishExamTest(value: unknown): value is EnglishExamTest {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as { sections?: unknown }).sections));
}

function isIeltsOrCpeTest(test: EnglishExamTest): boolean {
  const exam = inferExam(test);
  return exam === 'ielts' || exam === 'cpe';
}

function inferExam(test: EnglishExamTest): 'ielts' | 'cpe' | '' {
  const text = `${test.exam || ''} ${test.id || ''} ${test.title || ''}`.toLowerCase();
  if (text.includes('cpe') || text.includes('proficiency') || text.includes('camcp')) return 'cpe';
  if (text.includes('ielts') || text.includes('reading-sample') || text.includes('listening-sample')) return 'ielts';
  return '';
}

function inferSkill(test: EnglishExamTest, section: EnglishExamSection, question: EnglishExamQuestion): string {
  const skill = String(test.skill || '').toLowerCase();
  const text = `${section.title || ''} ${section.instructions || ''} ${question.category || ''} ${question.type || ''}`.toLowerCase();
  if ((inferExam(test) === 'cpe') && (/\bpart\s*[1-4]\b/.test(text) || text.includes('cloze') || text.includes('word formation') || text.includes('key word transformation'))) return 'use_of_english';
  return skill || 'reading';
}

function normalizeOptions(options: unknown): Array<{ key: string; text: string; raw: string }> {
  if (!Array.isArray(options)) return [];
  return options
    .map((option, index) => {
      const raw = typeof option === 'string' ? option : String((option as { content?: unknown; text?: unknown; label?: unknown })?.content ?? (option as { text?: unknown })?.text ?? option ?? '');
      const match = raw.match(/^\s*([A-Z])[\).:\s-]+(.+)$/i);
      return {
        key: match?.[1]?.toUpperCase() || String.fromCharCode(65 + index),
        text: plainText(match?.[2] || raw),
        raw: plainText(raw),
      };
    })
    .filter((option) => option.raw);
}

function flattenAcceptedAnswers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const flattened: string[] = [];
  for (const group of value) {
    if (Array.isArray(group)) {
      for (const answer of group) flattened.push(normalizeAnswer(answer));
    } else {
      flattened.push(normalizeAnswer(group));
    }
  }
  return unique(flattened.filter(Boolean));
}

function plainText(value: unknown): string {
  return String(value ?? '')
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAnswer(value: unknown): string {
  return plainText(value)
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[.,;:!?()[\]{}"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sameAnswer(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

function containsEvidence(source: string, evidence: string): boolean {
  const sourceNorm = normalizeLoose(source);
  const evidenceNorm = normalizeLoose(evidence);
  if (!evidenceNorm || evidenceNorm.length < 4) return true;
  if (sourceNorm.includes(evidenceNorm)) return true;
  const evidenceTokens = evidenceNorm.split(' ').filter((token) => token.length > 2);
  if (evidenceTokens.length < 3) return sourceNorm.includes(evidenceTokens.join(' '));
  const hits = evidenceTokens.filter((token) => sourceNorm.includes(token)).length;
  return hits / evidenceTokens.length >= 0.75;
}

function shouldRequireSourceEvidence(context: AuditContext, question: EnglishExamQuestion, answerLocation: string): boolean {
  if (!(context.skill === 'reading' || context.skill === 'listening')) return false;
  if (!answerLocation) return false;
  if (question.type === 'gapped_text' || question.type === 'multiple_matching') return false;
  if (question.type === 'multiple_choice' && isAnswerOptionReference(question, answerLocation)) return false;
  return true;
}

function isAnswerOptionReference(question: EnglishExamQuestion, answerLocation: string): boolean {
  const answer = normalizeAnswer(question.correctAnswer ?? question.acceptedAnswers?.[0]?.[0] ?? '').toUpperCase();
  const location = plainText(answerLocation);
  if (answer && new RegExp(`^${escapeRegExp(answer)}(?:\\.|\\s*[-:])\\s+`, 'i').test(location)) return true;
  return normalizeOptions(question.options).some((option) =>
    (sameAnswer(option.key, answer) && (sameAnswer(option.raw, location) || sameAnswer(option.text, location))) ||
    sameAnswer(option.text, location),
  );
}

function normalizeLoose(value: string): string {
  return plainText(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function textMentions(haystack: string, needle: string): boolean {
  const cleanNeedle = normalizeLoose(needle);
  if (!cleanNeedle) return false;
  const keyTokens = cleanNeedle.split(' ').filter((token) => token.length > 3);
  if (!keyTokens.length) return normalizeLoose(haystack).includes(cleanNeedle);
  const haystackNorm = normalizeLoose(haystack);
  return keyTokens.some((token) => haystackNorm.includes(token));
}

function mentionsDistractors(explanation: string, options: Array<{ key: string; text: string }>, correctAnswer: string): boolean {
  const wrongOptions = options.filter((option) => !sameAnswer(option.key, correctAnswer));
  const explanationNorm = normalizeLoose(explanation);
  return wrongOptions.some((option) => explanationNorm.includes(option.key.toLowerCase()) || textMentions(explanation, option.text));
}

function extractExplanationAnswerLetter(explanation: string): string {
  const text = plainText(explanation);
  const match = text.match(/(?:Đáp án(?:\s+chính\s+thức(?:\s+từ\s+Cambridge)?)?|Chọn)\s*:?\s*([A-D])(?=\s*(?:[-.]|$))/i);
  return match?.[1]?.toUpperCase() || '';
}

function hasPedagogicalDepth(explanation: string, question: EnglishExamQuestion): boolean {
  const text = explanation.toLowerCase();
  const hasCue = /(trap|distractor|avoid|confus|collocation|preposition|word form|tense|clause|idiom|pattern|paraphrase|context|contrast|however|rather than|instead of|why not|bẫy|mẹo|lưu ý|chú ý|loại|không chọn|nhầm|ngữ cảnh|ngữ pháp|từ loại|cấu trúc|đi với|vì|do|khác với)/i.test(text);
  if (hasCue) return true;
  if (question.type === 'multiple_choice') {
    return /['"]?[A-D]['"]?/.test(explanation) && explanation.length >= 140;
  }
  return explanation.length >= 180;
}

function hasLanguageKnowledgeCue(explanation: string): boolean {
  return /(collocation|preposition|word form|tense|aspect|clause|phrase|idiom|register|grammar|lexical|syntax|pattern|ngữ pháp|từ vựng|từ loại|cụm từ|cấu trúc|thì|mệnh đề|đi với|giới từ|sắc thái|ngữ cảnh)/i.test(explanation);
}

function minExplanationLength(context: AuditContext, question: EnglishExamQuestion): number {
  if (context.skill === 'use_of_english') return 90;
  if (question.type === 'multiple_choice') return 100;
  return 70;
}

function isCompactCambridgeGap(question: EnglishExamQuestion): boolean {
  return String(question.instruction || '').trim().match(/^gap\s*\(\d+\):?$/i) !== null;
}

function hasMojibake(value: string): boolean {
  return /(?:\u00C3[\u00A0-\u00BF]|\u00C4|\u00C6|\uFFFD|\u00E2\u20AC|\u00E1[\u00BA\u00BB]|\u00C6\u00B0|\u00C2\u00A3)/.test(value);
}

function isAllowedRepeatedWord(repeatedText: string): boolean {
  return ['had had', 'that that', 'much much', 'song song', 'chung chung'].includes(repeatedText);
}

function isHtmlBoundaryRepeat(rawValue: string, repeatedWord: string): boolean {
  const word = escapeRegExp(repeatedWord);
  return new RegExp(`${word}\\s*</h[1-6]>\\s*<p[^>]*>\\s*(?:<[^>]+>\\s*)*${word}\\b`, 'i').test(rawValue);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findCommonTypo(text: string): string {
  const typos = ['accomodation', 'recieve', 'seperate', 'definately', 'occured', 'wich', 'enviroment', 'goverment', 'neccessary', 'untill', 'publically', 'arguement', 'maintainance'];
  const lower = text.toLowerCase();
  return typos.find((typo) => new RegExp(`\\b${typo}\\b`, 'i').test(lower)) || '';
}

function questionKey(entry: Pick<DeepIssue, 'testId' | 'sectionId' | 'groupId' | 'questionId'>): string {
  return [entry.testId, entry.sectionId, entry.groupId, entry.questionId].join('::');
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(record: Record<string, number>, limit: number): Array<[string, number]> {
  return Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function compareIssues(a: DeepIssue, b: DeepIssue): number {
  return severityRank(a.severity) - severityRank(b.severity) ||
    a.exam.localeCompare(b.exam) ||
    a.testId.localeCompare(b.testId) ||
    a.sectionId.localeCompare(b.sectionId) ||
    a.groupId.localeCompare(b.groupId) ||
    naturalSortKey(a.questionId).localeCompare(naturalSortKey(b.questionId)) ||
    a.code.localeCompare(b.code);
}

function severityRank(severity: DeepIssueSeverity): number {
  return severity === 'blocker' ? 0 : severity === 'warning' ? 1 : 2;
}

function naturalSortKey(value: string): string {
  return String(value || '').replace(/\d+/g, (match) => match.padStart(8, '0'));
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function getArgValue(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0) return '';
  return process.argv[index + 1] || '';
}
