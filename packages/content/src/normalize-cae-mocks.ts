import type { EnglishExamQuestion, EnglishExamQuestionGroup, EnglishExamSection, EnglishExamTest } from './standard';

declare function require(name: string): any;
declare const process: { cwd(): string };

const fs = require('node:fs');
const path = require('node:path');

type MutableQuestion = EnglishExamQuestion & {
  tags?: string[];
  source?: string;
};

interface NormalizeStats {
  files: number;
  tests: number;
  questions: number;
  updatedFiles: number;
  acceptedAnswersSynced: number;
  explanationsEnhanced: number;
  answerLocationsEnhanced: number;
  topicsSynced: number;
  tagsRebuilt: number;
  transcriptFixes: number;
  correctAnswersRepaired: number;
}

const mocksDir = path.resolve(process.cwd(), 'src', 'mocks');
const stats: NormalizeStats = {
  files: 0,
  tests: 0,
  questions: 0,
  updatedFiles: 0,
  acceptedAnswersSynced: 0,
  explanationsEnhanced: 0,
  answerLocationsEnhanced: 0,
  topicsSynced: 0,
  tagsRebuilt: 0,
  transcriptFixes: 0,
  correctAnswersRepaired: 0,
};

for (const fileName of fs.readdirSync(mocksDir).filter((file: string) => file.endsWith('.json') && file.includes('cae')).sort()) {
  stats.files += 1;
  const fullPath = path.join(mocksDir, fileName);
  const before = fs.readFileSync(fullPath, 'utf8');
  const test = JSON.parse(before) as EnglishExamTest;
  if (!isCaeTest(test, fileName)) continue;

  stats.tests += 1;
  normalizeTest(test);

  const after = `${JSON.stringify(test, null, 2)}\n`;
  if (after !== before) {
    fs.writeFileSync(fullPath, after, 'utf8');
    stats.updatedFiles += 1;
  }
}

console.log(JSON.stringify(stats, null, 2));

function normalizeTest(test: EnglishExamTest): void {
  test.exam = 'cae';

  for (const section of test.sections || []) {
    if (typeof section.transcript === 'string') {
      const fixedTranscript = fixTranscriptOcr(section.transcript);
      if (fixedTranscript !== section.transcript) {
        section.transcript = fixedTranscript;
        stats.transcriptFixes += 1;
      }
    }

    for (const group of section.questionGroups || []) {
      for (const question of group.questions || []) {
        stats.questions += 1;
        normalizeQuestion(test, section, group, question as MutableQuestion);
      }
    }
  }
}

function normalizeQuestion(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: MutableQuestion,
): void {
  const skill = inferQuestionSkill(test, section, question);
  const topic = inferQuestionTopic(section, question, skill);
  const normalizedTopic = {
    id: topic.id,
    title: topic.title,
    skill,
    program: 'cae',
  };

  if (JSON.stringify(question.topic || {}) !== JSON.stringify(normalizedTopic) || question.category !== topic.id) {
    question.topic = normalizedTopic;
    question.category = topic.id;
    stats.topicsSynced += 1;
  }

  const rebuiltTags = buildQuestionTags(section, group, question, skill, topic.id);
  if (JSON.stringify(question.tags || []) !== JSON.stringify(rebuiltTags)) {
    question.tags = rebuiltTags;
    stats.tagsRebuilt += 1;
  }

  if (question.displayMode !== 'both') question.displayMode = question.displayMode || 'both';
  question.source = question.source || 'cae_mock';

  repairCorrectAnswer(question);

  const acceptedAnswers = normalizeAcceptedAnswers(question);
  if (JSON.stringify(question.acceptedAnswers || []) !== JSON.stringify(acceptedAnswers)) {
    question.acceptedAnswers = acceptedAnswers;
    stats.acceptedAnswersSynced += 1;
  }

  const answerLocation = buildAnswerLocation(section, group, question, skill);
  if (answerLocation && answerLocation !== question.answerLocation) {
    question.answerLocation = answerLocation;
    stats.answerLocationsEnhanced += 1;
  }

  const explanation = buildExplanation(section, question, skill);
  if (explanation && explanation !== question.explanation) {
    question.explanation = explanation;
    stats.explanationsEnhanced += 1;
  }
}

function normalizeAcceptedAnswers(question: MutableQuestion): string[][] {
  const correctAnswers = flattenAnswers(question.correctAnswer);
  if (isChoiceQuestion(question)) {
    return unique(correctAnswers.map((answer) => cleanAcceptedAnswer(answer, question, true)).filter(Boolean)).map((answer) => [answer]);
  }

  const existingAnswers = flattenAcceptedAnswers(question.acceptedAnswers).flatMap(expandAnswerCandidate);
  const allAnswers = [...correctAnswers, ...existingAnswers].flatMap(expandAnswerCandidate);
  const correctAnswerSet = new Set(correctAnswers.flatMap(expandAnswerCandidate).map((answer) => normalizeAnswer(answer)));
  const cleanedAnswers = unique(allAnswers.map((answer) => cleanAcceptedAnswer(answer, question, correctAnswerSet.has(normalizeAnswer(answer)))).filter(Boolean));

  return cleanedAnswers.map((answer) => [answer]);
}

function repairCorrectAnswer(question: MutableQuestion): void {
  if (!(question.type === 'gap_fill' || question.type === 'table_completion')) return;
  const correctAnswer = String(question.correctAnswer ?? '').trim();
  if (!/^[a-z]$/i.test(correctAnswer)) return;

  const existingAnswers = flattenAcceptedAnswers(question.acceptedAnswers);
  const optionalVariant = existingAnswers.find((answer) => new RegExp(`\\(${escapeRegExp(correctAnswer)}\\)`, 'i').test(answer));
  if (!optionalVariant) return;

  question.correctAnswer = optionalVariant;
  stats.correctAnswersRepaired += 1;
}

function buildAnswerLocation(
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: MutableQuestion,
  skill: string,
): string {
  const current = cleanRepeatedWords(String(question.answerLocation || '').trim());
  const primaryAnswer = primaryCorrectAnswer(question);
  const correctOption = getCorrectOption(question);
  const sourceText = plainText([section.passageHtml, group.passageText, question.passageHtml, section.transcript].filter(Boolean).join(' '));

  if (skill === 'listening') {
    const evidence = correctOption
      ? `Answer-key evidence: ${correctOption.key}. Correct option: ${correctOption.text}. Use the audio/transcript to confirm the speaker's paraphrase and eliminate distractors.`
      : `Answer-key evidence: ${primaryAnswer || current}. Listen for the exact word form or phrase that completes the sentence in ${section.title}.`;
    return evidence;
  }

  if (question.type === 'multiple_choice' && correctOption) {
    const optionText = sameAnswer(correctOption.key, correctOption.text) ? 'Answer-key option' : correctOption.text;
    return `${correctOption.key}. ${optionText}. Evidence cue: use this answer-key option with the passage/audio paraphrase; confirm the full claim, not just a repeated keyword.`;
  }

  if (skill === 'reading') {
    const sourceSentence = findSourceSentence(sourceText, [current, primaryAnswer, correctOption?.text || '']);
    if (sourceSentence) return sourceSentence;
    if (current.length >= 36) return current;
  }

  if (isShortEvidence(current) || looksTruncated(current)) {
    const prompt = truncate(plainText([group.instruction, question.instruction].filter(Boolean).join(' ')), 120);
    const answer = primaryAnswer || current;
    return `Source gap: ${prompt}. Correct completion: ${answer}.`;
  }

  return current;
}

function buildExplanation(section: EnglishExamSection, question: MutableQuestion, skill: string): string {
  const current = cleanRepeatedWords(String(question.explanation || '').trim());
  const correctOption = getCorrectOption(question);
  const primaryAnswer = primaryCorrectAnswer(question);
  const notes: string[] = [];
  const lower = current.toLowerCase();

  if (question.type === 'multiple_choice' && correctOption && !textMentions(current, correctOption.text)) {
    notes.push(`Correct option ${correctOption.key}: "${correctOption.text}".`);
  }

  const needsMethod = !/\b(Method|Trap|Language rule)\s*:/i.test(current);
  if (needsMethod) {
    notes.push(methodNote(section, question, skill, primaryAnswer));
  }

  if (skill === 'use_of_english' && !hasLanguageCue(current)) {
    notes.push(languageRuleNote(question));
  }

  if (!notes.length && hasMinimumExplanationDepth(current, skill, question)) return current;
  const enhanced = uniqueSentences([current, ...notes]).join(' ').replace(/\s+/g, ' ').trim();
  return enhanced;
}

function methodNote(section: EnglishExamSection, question: MutableQuestion, skill: string, primaryAnswer: string): string {
  if (skill === 'listening') {
    if (question.type === 'multiple_choice' || question.type === 'multiple_matching') {
      return 'Method: match the speaker meaning by paraphrase, attitude and function, not by one repeated keyword. Trap: distractors often echo a word from the recording but change the opinion, time or scope.';
    }
    return 'Method: listen for the exact word form that fits the grammar around the blank. Trap: near-synonyms may sound plausible, but the answer must preserve the noun phrase, number and spelling required by the sentence.';
  }

  if (question.type === 'multiple_choice') {
    return 'Method: read both sides of the gap and choose the option that fits meaning, collocation and grammar. Trap: reject distractors that are close in meaning but do not fit the pattern or register in context.';
  }

  if (question.type === 'multiple_matching' || question.type === 'gapped_text') {
    return 'Method: match by paraphrase and discourse logic, then eliminate partial matches. Trap: a repeated keyword alone is not enough; check reference, contrast and the full claim.';
  }

  if (skill === 'reading') {
    return 'Method: locate the evidence in the passage and compare the exact claim, not just the topic. Trap: CAE reading often hides the answer in paraphrase, contrast or qualification.';
  }

  return `Method: complete the gap with "${primaryAnswer}" only after checking the words before and after it. Trap: keep the sentence grammatical and avoid answers that fit the topic but break the structure.`;
}

function languageRuleNote(question: MutableQuestion): string {
  const topicId = String(question.topic?.id || question.category || '').toLowerCase();
  if (topicId.includes('part_1')) {
    return 'Language rule: Part 1 tests lexical choice, collocation, phrasal verbs and register; the correct option must fit both meaning and pattern.';
  }
  if (topicId.includes('part_2')) {
    return 'Language rule: open cloze usually tests grammar words such as articles, prepositions, auxiliaries, pronouns, linkers and fixed phrases.';
  }
  if (topicId.includes('part_3')) {
    return 'Language rule: word formation requires the correct part of speech, affix, spelling and sometimes negative/positive meaning.';
  }
  if (topicId.includes('part_4')) {
    return 'Language rule: key word transformation keeps the key word unchanged while preserving meaning through grammar pattern and lexical control.';
  }
  if (topicId.includes('error_correction')) {
    return 'Language rule: error correction checks redundancy, spelling, punctuation, agreement, verb pattern, articles and prepositions line by line.';
  }
  return 'Language rule: check grammar, collocation, word form and discourse context before accepting the answer.';
}

function inferQuestionTopic(section: EnglishExamSection, question: MutableQuestion, skill: string): { id: string; title: string } {
  const existingId = String(question.topic?.id || question.category || '').trim();
  if (existingId.startsWith('cae_')) {
    return { id: existingId, title: String(question.topic?.title || section.title || existingId).trim() };
  }

  const text = `${section.title} ${section.id} ${question.type}`.toLowerCase();
  const part = text.match(/part\s*(\d+)/)?.[1] || text.match(/-p(\d)-/)?.[1] || '';
  const id = skill === 'use_of_english' && /error correction|proofreading/.test(text)
    ? 'cae_use_of_english_error_correction'
    : part
      ? `cae_${skill}_part_${part}`
      : `cae_${skill}_general`;
  return { id, title: String(section.title || id).trim() };
}

function inferQuestionSkill(test: EnglishExamTest, section: EnglishExamSection, question: MutableQuestion): string {
  const topicSkill = String(question.topic?.skill || '').trim().toLowerCase();
  if (topicSkill === 'listening' || topicSkill === 'reading' || topicSkill === 'use_of_english') return topicSkill;

  const category = String(question.category || '').toLowerCase();
  if (category.includes('_listening_')) return 'listening';
  if (category.includes('use_of_english') || category.includes('error_correction')) return 'use_of_english';
  if (category.includes('_reading_')) return 'reading';

  const explicitSkill = String(test.skill || '').trim().toLowerCase();
  if (explicitSkill === 'listening') return 'listening';

  const text = `${section.title || ''} ${section.instructions || ''} ${question.type || ''}`.toLowerCase();
  if (/use of english|cloze|word formation|key word|error correction|proofreading/.test(text)) return 'use_of_english';
  return 'reading';
}

function buildQuestionTags(
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: MutableQuestion,
  skill: string,
  topicId: string,
): string[] {
  return unique([
    'english_core',
    'cae',
    skill,
    topicId,
    String(question.type || ''),
    String(question.displayMode || 'both'),
    `section:${slug(section.id || section.title)}`,
    `group:${slug(group.id || group.instruction)}`,
  ]);
}

function flattenAnswers(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(flattenAnswers);
  const text = String(value ?? '').trim();
  return text ? [text] : [];
}

function flattenAcceptedAnswers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group) => (Array.isArray(group) ? group : [group])).map((answer) => String(answer ?? '').trim()).filter(Boolean);
}

function extractAnswerCandidates(value: string): string[] {
  const text = plainText(value);
  const official = text.match(/(?:Đáp án chính thức|Dap an chinh thuc|Correct completion|Answer-key evidence|Correct answer)\s*:?\s*([^.;]+(?:\/[^.;]+)*)/i)?.[1] || '';
  const candidateText = official || text;
  return candidateText
    .split(/[\/|]/)
    .map((candidate) => candidate.replace(/\bNguồn\b.*$/i, '').replace(/\bSource\b.*$/i, '').trim())
    .filter(Boolean);
}

function expandAnswerCandidate(candidate: string): string[] {
  const clean = candidate.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
  const withoutParentheses = clean.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  const withoutOptional = clean.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  return unique([clean, withoutParentheses, withoutOptional]);
}

function cleanAcceptedAnswer(candidate: string, question: MutableQuestion, isCorrectAnswer = false): string {
  const text = plainText(candidate)
    .replace(/\*\*/g, '')
    .replace(/^\s*(?:(?:answer|đáp án|dap an)\b|correct option\b|correct completion\b|source gap\b)\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';

  const isAnswerKey = /^[A-Z]$/i.test(text);
  const isCorrectMark = /^[✓✔]$/.test(text);
  const correctText = primaryCorrectAnswer(question);
  const correctIsPhrase = correctText.split(/\s+/).length > 1;
  if (!isCorrectAnswer && !isAnswerKey && !isCorrectMark && isExplanationLikeAnswer(text)) return '';
  if (!isCorrectAnswer && !isAnswerKey && !isCorrectMark && text.length > 96) return '';
  if (!isAnswerKey && !isCorrectMark && text.length < 2) return '';
  if (!isAnswerKey && !isCorrectMark && correctIsPhrase && text.length < 4) return '';
  if (!isAnswerKey && !isCorrectMark && hasUnbalancedParentheses(text)) return '';
  if (!isCorrectAnswer && !isAnswerKey && !isCorrectMark && /\b[a-z]$/i.test(text) && text.length <= 8 && correctIsPhrase) return '';
  return text;
}

function primaryCorrectAnswer(question: MutableQuestion): string {
  return flattenAnswers(question.correctAnswer)[0] || flattenAcceptedAnswers(question.acceptedAnswers)[0] || '';
}

function getCorrectOption(question: MutableQuestion): { key: string; text: string } | null {
  const answer = normalizeAnswer(primaryCorrectAnswer(question)).toUpperCase();
  const options = normalizeOptions(question.options);
  return options.find((option) => option.key.toUpperCase() === answer) || null;
}

function normalizeOptions(options: unknown): Array<{ key: string; text: string }> {
  if (!Array.isArray(options)) return [];
  return options
    .map((option, index) => {
      const raw = String(option ?? '').trim();
      const match = raw.match(/^\s*([A-Z])[\).:\s-]+(.+)$/i);
      return {
        key: (match?.[1] || String.fromCharCode(65 + index)).toUpperCase(),
        text: plainText(match?.[2] || raw),
      };
    })
    .filter((option) => option.text);
}

function findSourceSentence(source: string, candidates: string[]): string {
  const cleanSource = plainText(source);
  if (!cleanSource) return '';
  const sentences = cleanSource.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  for (const candidate of candidates.map(plainText).filter((value) => value.length >= 4)) {
    const match = sentences.find((sentence) => textMentions(sentence, candidate));
    if (match) return truncate(match, 260);
  }
  return '';
}

function isShortEvidence(value: string): boolean {
  const words = plainText(value).split(/\s+/).filter(Boolean);
  return value.length < 36 || words.length < 5;
}

function looksTruncated(value: string): boolean {
  return plainText(value).length > 60 && /(?:,\s*|;\s*|\b(?:and|or|but|because|although|while)\s*)$/i.test(plainText(value));
}

function isChoiceQuestion(question: MutableQuestion): boolean {
  return question.type === 'multiple_choice' || question.type === 'multiple_matching' || question.type === 'gapped_text';
}

function isExplanationLikeAnswer(value: string): boolean {
  return /\b(Method|Trap|Language rule|Phân tích|Giải thích|Nguồn|Source|Chọn|Dòng này|line|because|vì|do|không chọn|nơi chốn|nghĩa|thành ngữ|câu|cụm|etc)\b|:/i.test(value);
}

function hasMinimumExplanationDepth(value: string, skill: string, question: MutableQuestion): boolean {
  const minLength = skill === 'use_of_english' ? 90 : question.type === 'multiple_choice' ? 100 : 70;
  return plainText(value).length >= minLength;
}

function hasLanguageCue(value: string): boolean {
  return /(collocation|preposition|word form|tense|aspect|clause|phrase|idiom|register|grammar|lexical|syntax|pattern|ngữ pháp|từ vựng|từ loại|cụm từ|cấu trúc|thì|mệnh đề|giới từ|sắc thái|ngữ cảnh)/i.test(value);
}

function textMentions(haystack: string, needle: string): boolean {
  const haystackText = normalizeLoose(haystack);
  const needleText = normalizeLoose(needle);
  if (!needleText) return false;
  if (haystackText.includes(needleText)) return true;
  const tokens = needleText.split(' ').filter((token) => token.length > 3);
  return tokens.length > 0 && tokens.some((token) => haystackText.includes(token));
}

function normalizeAnswer(value: unknown): string {
  return plainText(value)
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLoose(value: string): string {
  return plainText(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
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

function cleanRepeatedWords(value: string): string {
  return value.replace(/\b([A-Za-zÀ-ỹ]{3,})\s+\1\b/gi, (match, word) => {
    const repeated = match.toLowerCase();
    return ['had had', 'that that', 'much much', 'song song', 'chung chung'].includes(repeated) ? match : word;
  });
}

function fixTranscriptOcr(value: string): string {
  return value
    .replace(/\bquestions\s+<\)\s+to\s+16\b/gi, 'questions 9 to 16')
    .replace(/\bQuestions\s+<\)\s+to\s+16\b/g, 'Questions 9 to 16')
    .replace(/\bCor D\b/g, 'C or D');
}

function uniqueSentences(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map((entry) => entry.trim()).filter(Boolean)) {
    const key = normalizeLoose(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map((entry) => String(entry || '').trim()).filter(Boolean)) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function hasUnbalancedParentheses(value: string): boolean {
  return (value.match(/\(/g) || []).length !== (value.match(/\)/g) || []).length;
}

function sameAnswer(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCaeTest(test: EnglishExamTest, fileName: string): boolean {
  const text = `${fileName} ${test.exam || ''} ${test.id || ''} ${test.title || ''}`.toLowerCase();
  return text.includes('cae') || text.includes('advanced');
}

function slug(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}
