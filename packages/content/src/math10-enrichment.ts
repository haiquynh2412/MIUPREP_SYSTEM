import type { QuestionItem } from './standard';

interface Math10AutoSolution {
  answer: string;
  solution: string;
  kind: string;
  confidence: number;
  prompt?: string;
  reviewNote?: string;
}

interface ChoiceOption {
  key: string;
  text: string;
  markerStart: number;
  contentStart: number;
}

interface ChoiceParseResult {
  options: ChoiceOption[];
  optionStart: number;
  trailingAnswerKey?: string;
  promptWithoutTrailingAnswer?: string;
}

interface PropositionClassification {
  value: boolean;
  reason: string;
}

interface CoordinatePoint {
  label?: string;
  x: number;
  y: number;
}

interface LinearEquation {
  a: number;
  b: number;
  c: number;
}

interface SetBuilderEquation {
  domain: 'N' | 'Z' | 'Q' | 'R';
  domainText: string;
  equationText: string;
  expression: string;
}

const AUTO_SOLUTION_REVIEWED_AT = '2026-06-08';
const MIN_AUTO_SCORING_CONFIDENCE = 0.86;
const OPTION_SEQUENCE = ['A', 'B', 'C', 'D'];

export function applyMath10AutoEnrichment(item: QuestionItem): QuestionItem {
  if (hasScorableAnswer(item.correctAnswer)) return item;
  const auto = buildMath10AutoSolution(item);
  if (!auto || auto.confidence < MIN_AUTO_SCORING_CONFIDENCE) return item;

  const explanation = mergeMath10Explanation(item, auto);
  return {
    ...item,
    prompt: auto.prompt || item.prompt,
    correctAnswer: auto.answer,
    explanation,
    misconceptionIds: uniqueStrings([
      ...item.misconceptionIds,
      ...inferMath10Misconceptions(item),
    ]),
    tags: uniqueStrings([
      ...item.tags,
      'pedagogy:auto_enriched',
      `solution:${auto.kind}`,
    ]),
    metadata: {
      ...item.metadata,
      solutionStatus: 'generated_miumath_solution',
      guidedSolutionStatus: 'generated_miumath_solution',
      scoringReadiness: 'scored_practice_candidate',
      generatedAnswer: auto.answer,
      generatedSolutionKind: auto.kind,
      generatedSolutionConfidence: auto.confidence,
      generatedSolutionReviewedAt: AUTO_SOLUTION_REVIEWED_AT,
      generatedSolutionReviewNote: auto.reviewNote || 'safe_rule_based_solver',
    },
  };
}

export function buildMath10AutoSolution(item: QuestionItem): Math10AutoSolution | undefined {
  const rawPrompt = normalizeInline(String(item.prompt || ''));
  const prompt = stripMath10SourceNoise(rawPrompt);
  if (!prompt || prompt.length < 16) return undefined;
  if (hasRecoveredSourceSnippet(item)) return undefined;

  const auto = extractInlineChoiceAnswer(prompt)
    || solveLogicImplicationTruthTablePrompt(item, prompt)
    || solveLogicNegationPrompt(item, prompt)
    || solveLogicConversePrompt(item, prompt)
    || solveQuantifierTranslationPrompt(item, prompt)
    || solveQuantifierMeaningPrompt(item, prompt)
    || solveVectorIdentityPrompt(item, prompt)
    || solveLinearInequalityFormPrompt(item, prompt)
    || solveLinearInequalityPointPrompt(item, prompt)
    || solveOxyAxisDistancePrompt(item, prompt)
    || solveOxyDistancePrompt(item, prompt)
    || solveOxyLinePrompt(item, prompt)
    || solveOpenSentenceValuePrompt(item, prompt)
    || solveFiniteSetOperationPrompt(item, prompt)
    || solveLogicSetPropositionPrompt(item, prompt);
  if (!auto) return undefined;
  if (rawPrompt !== prompt && !auto.prompt) return { ...auto, prompt };
  return auto;
}

function stripMath10SourceNoise(value: string): string {
  return normalizeInline(String(value || '')
    .replace(/^\s*Li\S*n\s+h\S+\s+t\S+i\s+li\S+u.*$/gimu, ' ')
    .replace(/^\s*Gi\S*o\s+vi\S*n\s*:.*$/gimu, ' ')
    .replace(/^\s*CLB\s+Gi\S*o\s+vi\S*n\s+tr\S+.*$/gimu, ' ')
    .replace(/\bLiờn\s+hệ\s+tài\s+liệu[\s\S]*?(?=\s+[A-D]\.\s|$)/giu, ' ')
    .replace(/\bLi\S*n\s+h\S+\s+t\S+i\s+li\S+u[\s\S]*?(?=\s+[A-D]\.\s|$)/giu, ' ')
    .replace(/\bGi\S*o\s+vi\S*n\s*:[\s\S]*?(?=\s+[A-D]\.\s|$)/giu, ' ')
    .replace(/\bCLB\s+Gi\S*o\s+vi\S*n\s+tr\S+[\s\S]*?(?=\s+[A-D]\.\s|$)/giu, ' '));
}

function extractInlineChoiceAnswer(prompt: string): Math10AutoSolution | undefined {
  const parsed = parseChoiceOptions(prompt);
  if (parsed?.trailingAnswerKey && parsed.promptWithoutTrailingAnswer) {
    const answer = parsed.trailingAnswerKey;
    return {
      answer,
      prompt: parsed.promptWithoutTrailingAnswer,
      solution: [
        `Dap an ${answer} duoc phuc hoi tu dau dap an dung bi dinh o cuoi cau hoi trong nguon.`,
        `Khi day hoc, van yeu cau hoc sinh tu nhan dien dang bai va giai thich vi sao chon ${answer}, khong cho hoc sinh thay dau dap an trong de.`,
      ].join(' '),
      kind: 'inline_choice_answer_recovered',
      confidence: 0.93,
      reviewNote: 'trailing_choice_answer_removed_from_prompt',
    };
  }

  const explicit = prompt.match(/(?:^|\s)(?:dap\s*an|chon)\s*[:.]?\s*([A-D])\.?\s*$/i);
  if (explicit?.[1] && parsed?.options.some((option) => option.key === explicit[1].toUpperCase())) {
    const answer = explicit[1].toUpperCase();
    return {
      answer,
      prompt: normalizeInline(prompt.slice(0, explicit.index || prompt.length)),
      solution: `Dap an ${answer} duoc lay tu dong dap an ngan trong nguon; he thong da cat phan nay khoi de bai de tranh lo dap an.`,
      kind: 'inline_choice_answer_recovered',
      confidence: 0.91,
      reviewNote: 'explicit_choice_answer_removed_from_prompt',
    };
  }

  return undefined;
}

function solveLogicSetPropositionPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;

  return solveReferencedPropositionChoicePrompt(prompt)
    || solvePropositionCountPrompt(prompt)
    || solvePropositionChoicePrompt(prompt);
}

function solveFiniteSetOperationPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  if (/\{\{formula:/.test(prompt)) return undefined;
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  if (parsed.optionStart > 900) return undefined;

  return solveSetBuilderEmptinessChoicePrompt(prompt, parsed)
    || solveBasicSetRelationPrompt(prompt, parsed)
    || solveFiniteSetOperationChoicePrompt(prompt, parsed)
    || solveFiniteSubsetCountPrompt(prompt, parsed)
    || solveFiniteSetChoiceBySubsetTotalPrompt(prompt, parsed)
    || solveFiniteSetBetweenCountPrompt(prompt, parsed)
    || solveCommonDivisorSetListingPrompt(prompt, parsed);
}

function solveLogicImplicationTruthTablePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;

  if (/\bp\s*(?:=>|⇒|keo theo)\s*q\b/.test(search) && /\b(?:sai|khong the dung|khong the dung de phat bieu)\b/.test(search)) {
    const falseCase = parsed.options.find((option) => {
      const optionSearch = normalizeSearchText(option.text);
      return /\bp\s+dung\b/.test(optionSearch) && /\bq\s+sai\b/.test(optionSearch);
    });
    if (falseCase && /\b(?:tim dieu kien|de menh de p|p\s*(?:=>|⇒))/.test(search)) {
      return {
        answer: falseCase.key,
        solution: [
          'Cach quan sat: voi menh de keo theo P => Q, truong hop duy nhat lam menh de sai la P dung nhung Q sai.',
          `Trong cac lua chon, ${falseCase.key} dien ta dung truong hop P dung va Q sai.`,
          `Vay chon ${falseCase.key}.`,
          'Bay can tranh: khong nham P sai, Q sai voi menh de sai; khi P sai thi P => Q van duoc xem la dung trong logic menh de.',
        ].join(' '),
        kind: 'logic_implication_truth_table_solver',
        confidence: 0.93,
      };
    }
  }

  if (/\ba\s*(?:=>|⇒)\s*b\b/.test(search) && /\bkhong the\b.{0,80}\bphat bieu\b/.test(search)) {
    const wrongCondition = parsed.options.find((option) => {
      const optionSearch = normalizeSearchText(option.text);
      return /\ba\b.{0,30}\bdieu kien can\b/.test(optionSearch) && /\bb\b/.test(optionSearch);
    });
    if (wrongCondition) {
      return {
        answer: wrongCondition.key,
        solution: [
          'Cach quan sat: A => B doc la "neu A thi B"; A la dieu kien du de co B, con B la dieu kien can de co A.',
          `Lua chon ${wrongCondition.key} noi A la dieu kien can de co B, tuc dao chieu vai tro dieu kien, nen khong dung de phat bieu A => B.`,
          `Vay chon ${wrongCondition.key}.`,
          'Bay can tranh: can/du rat de dao nguoc; hay viet mau A => B roi doc "co A thi chac co B".',
        ].join(' '),
        kind: 'logic_implication_condition_solver',
        confidence: 0.9,
      };
    }
  }

  return undefined;
}

function solveLogicNegationPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\b(?:phu dinh|menh de phu dinh)\b/.test(search)) return undefined;
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;

  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const quoted = extractFirstQuotedText(beforeOptions) || extractStatementAfterLastColon(beforeOptions);
  const quotedLogic = normalizeLogicText(quoted || '');
  const options = parsed.options.map((option) => ({ option, logic: normalizeLogicText(option.text), search: normalizeSearchText(option.text) }));
  const asksForTruthStatus = /\bxet\b.{0,40}\b(?:dung|sai)\b/.test(search)
    || options.some((entry) => /\bday la menh de\b/.test(entry.search));

  if (quotedLogic.includes('∀') || quotedLogic.includes('∃')) {
    if (asksForTruthStatus) return undefined;
    const originalQuantifier = quotedLogic.includes('∀') ? '∀' : '∃';
    const targetQuantifier = originalQuantifier === '∀' ? '∃' : '∀';
    const negatedOperator = getNegatedRelationOperator(quotedLogic);
    const hasDivisibility = /[⋮]/.test(quotedLogic) || /\bchia het\b/.test(normalizeSearchText(quoted || ''));
    const hasPrime = /\bnguyen to\b/.test(normalizeSearchText(quoted || ''));

    const matches = options.filter((entry) => {
      if (!entry.logic.includes(targetQuantifier)) return false;
      if (!hasCompatibleDomain(quotedLogic, entry.logic)) return false;
      if (negatedOperator && logicHasRelationOperator(entry.logic, negatedOperator)) return true;
      if (hasDivisibility && (entry.logic.includes('⋮/') || entry.search.includes('khong chia het'))) return true;
      if (hasPrime && entry.search.includes('khong') && entry.search.includes('nguyen to')) return true;
      return false;
    });
    if (matches.length !== 1) return undefined;
    const answer = matches[0].option.key;
    return {
      answer,
      solution: [
        'Cach quan sat: phu dinh menh de co luong tu thi doi luong tu va phu dinh menh de ben trong.',
        'Cu the: phu dinh cua "voi moi" la "ton tai", phu dinh cua "ton tai" la "voi moi"; dau so sanh doi sang dau doi lap.',
        `Lua chon ${answer} thuc hien dung quy tac nay, nen chon ${answer}.`,
        'Bay can tranh: khong chi doi dau bat dang thuc ma quen doi luong tu.',
      ].join(' '),
      kind: 'logic_quantified_negation_solver',
      confidence: 0.9,
    };
  }

  const relation = quoted ? splitRelation(quoted) : undefined;
  if (relation) {
    const negated = negateRelationOperator(relation.operator);
    if (!negated) return undefined;
    const matches = options.filter((entry) => logicHasRelationOperator(entry.logic, negated));
    if (matches.length !== 1) return undefined;
    const answer = matches[0].option.key;
    return {
      answer,
      solution: [
        'Cach quan sat: phu dinh cua mot bat dang thuc la doi sang mien gia tri con lai.',
        `Dau ${relation.operator} duoc phu dinh thanh ${negated}.`,
        `Trong cac lua chon, ${answer} dung quy tac nay, nen chon ${answer}.`,
        'Bay can tranh: khong thay phu dinh cua <= bang "khac"; voi so sanh thu tu, phu dinh cua <= la >.',
      ].join(' '),
      kind: 'logic_relation_negation_solver',
      confidence: 0.91,
    };
  }

  const simpleNegation = solveSimpleSentenceNegation(quoted || '', options);
  if (simpleNegation) return simpleNegation;

  return undefined;
}

function solveLogicConversePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\bmenh de dao\b/.test(search)) return undefined;
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const quoted = extractFirstQuotedText(prompt.slice(0, parsed.optionStart));
  const conditional = extractIfThenParts(quoted || '');
  if (!conditional) return undefined;
  const premiseTokens = contentTokens(conditional.premise);
  const conclusionTokens = contentTokens(conditional.conclusion);
  if (premiseTokens.length < 1 || conclusionTokens.length < 1) return undefined;
  if (premiseTokens.length + conclusionTokens.length < 3) return undefined;

  const matches = parsed.options.filter((option) => {
    const optionConditional = extractIfThenParts(option.text);
    if (!optionConditional) return false;
    return tokenOverlapRatio(contentTokens(optionConditional.premise), conclusionTokens) >= 0.55
      && tokenOverlapRatio(contentTokens(optionConditional.conclusion), premiseTokens) >= 0.55;
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].key;
  return {
    answer,
    solution: [
      'Cach quan sat: menh de dao cua "Neu P thi Q" la "Neu Q thi P".',
      'Viec can lam la doi cho gia thiet va ket luan, khong phu dinh hai ve.',
      `Lua chon ${answer} doi dung hai ve cua menh de da cho, nen chon ${answer}.`,
      'Bay can tranh: menh de dao khac menh de phu dinh va khac menh de phan dao.',
    ].join(' '),
    kind: 'logic_converse_statement_solver',
    confidence: 0.9,
  };
}

function solveQuantifierTranslationPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\b(?:su dung|dung)\b.{0,50}\b(?:ki hieu|ky hieu|∀|∃)\b/.test(search)) return undefined;
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const sentence = normalizeSearchText(extractFirstQuotedText(prompt.slice(0, parsed.optionStart)) || prompt.slice(0, parsed.optionStart));
  const specs = getQuantifierTranslationSpecs(sentence);
  if (!specs.length) return undefined;
  const matches = parsed.options.filter((option) => {
    const logic = normalizeLogicText(option.text);
    const optionSearch = normalizeSearchText(option.text);
    return specs.every((spec) => spec(logic, optionSearch));
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].key;
  return {
    answer,
    solution: [
      'Cach quan sat: doc cac tu khoa luong tu truoc khi nhin cong thuc.',
      '"Voi moi"/"bat ki" ung voi ∀, con "co"/"ton tai"/"it nhat mot" ung voi ∃; sau do gan dung tap so va menh de theo sau.',
      `Lua chon ${answer} khop dung luong tu, mien xet va menh de trong cau, nen chon ${answer}.`,
      'Bay can tranh: chi can sai mot trong ba phan luong tu, tap xet, hoac bieu thuc thi ca menh de da sai.',
    ].join(' '),
    kind: 'logic_quantifier_translation_solver',
    confidence: 0.9,
  };
}

function solveQuantifierMeaningPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\b(?:khang dinh rang|khang dinh nao dung)\b/.test(search)) return undefined;
  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const quoted = normalizeLogicText(extractFirstQuotedText(prompt.slice(0, parsed.optionStart)) || '');
  if (!quoted) return undefined;
  const optionMatches = getQuantifierMeaningOptionMatchers(quoted);
  if (!optionMatches.length) return undefined;
  const matches = parsed.options.filter((option) => {
    const optionSearch = normalizeSearchText(option.text);
    return optionMatches.every((matcher) => matcher(optionSearch));
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].key;
  return {
    answer,
    solution: [
      'Cach quan sat: chuyen ki hieu luong tu ve loi van truoc.',
      '∀ doc la "moi/voi moi"; ∃ doc la "co it nhat mot"; mien sau ∈ cho biet dang so dang xet.',
      `Lua chon ${answer} doc dung toan bo menh de ki hieu, nen chon ${answer}.`,
      'Bay can tranh: ∃ khong co nghia la "duy nhat"; ∀ khong co nghia la "co mot".',
    ].join(' '),
    kind: 'logic_quantifier_meaning_solver',
    confidence: 0.89,
  };
}

function solveVectorIdentityPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  if (!topicId.includes('vectors') && !patternId.includes('vector')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\bdang thuc nao\b/.test(search) && !/\bkhang dinh nao\b/.test(search)) return undefined;
  if (!/\b(?:dung|sai)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const classified = parsed.options.map((option) => ({
    option,
    equality: classifyVectorEquality(option.text),
  }));
  if (classified.some((entry) => entry.equality === undefined)) return undefined;

  const asksForFalse = /\b(?:sai|khong dung)\b/.test(search);
  const target = !asksForFalse;
  const matches = classified.filter((entry) => entry.equality === target);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  const details = classified.map((entry) => `${entry.option.key}: ${entry.equality ? 'dung' : 'sai'}.`);
  return {
    answer,
    solution: [
      'Cach quan sat: dung quy tac vec-to AB = B - A; moi hang thuc chat la tong/hieu cac diem dau-cuoi.',
      'Sau khi rut gon he so cua tung diem o hai ve, hai bieu thuc bang nhau khi cac he so trung nhau.',
      ...details,
      asksForFalse
        ? `Chi lua chon ${answer} cho dang thuc sai, nen chon ${answer}.`
        : `Chi lua chon ${answer} cho dang thuc dung, nen chon ${answer}.`,
      'Bay can tranh: khong cong do dai; day la cong vec-to co huong, nen AB va BA trai dau nhau.',
    ].join(' '),
    kind: asksForFalse ? 'vector_identity_false_choice_solver' : 'vector_identity_true_choice_solver',
    confidence: 0.9,
  };
}

function solveOxyDistancePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  if (!topicId.includes('coordinate_plane_oxy') && !patternId.includes('oxy.distance')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\bkhoang cach\b.{0,80}\b(?:giua hai diem|hai diem)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const points = extractCoordinatePoints(beforeOptions);
  if (points.length < 2) return undefined;

  const [first, second] = points;
  if (!first || !second) return undefined;
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const distanceSquared = dx * dx + dy * dy;
  const options = parsed.options.map((option) => ({ option, valueSquared: parseDistanceOptionSquared(option.text) }));
  if (options.filter((entry) => entry.valueSquared !== undefined).length < 3) return undefined;
  const matches = options.filter((entry) => entry.valueSquared !== undefined && Math.abs((entry.valueSquared || 0) - distanceSquared) <= 1e-8);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  return {
    answer,
    solution: [
      'Cach quan sat: bai hoi khoang cach giua hai diem trong Oxy nen dung cong thuc do dai theo hieu toa do.',
      `Voi ${first.label || 'diem thu nhat'}(${formatNumber(first.x)}; ${formatNumber(first.y)}) va ${second.label || 'diem thu hai'}(${formatNumber(second.x)}; ${formatNumber(second.y)}), ta co dx = ${formatNumber(dx)}, dy = ${formatNumber(dy)}.`,
      `Suy ra d^2 = dx^2 + dy^2 = ${formatNumber(distanceSquared)}, nen do dai khop voi lua chon ${answer}.`,
      `Vay chon ${answer}.`,
      'Bay can tranh: khong cong rieng tung toa do; phai lay hieu toa do roi binh phuong, cong lai va can bac hai.',
    ].join(' '),
    kind: 'oxy_two_point_distance_solver',
    confidence: 0.9,
  };
}

function solveOxyAxisDistancePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  if (!topicId.includes('coordinate_plane_oxy') && !patternId.includes('oxy.distance')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\btim diem\b/.test(search) || !/\bthuoc\b.{0,30}\b(?:truc hoanh|truc tung|ox|oy)\b/.test(search)) return undefined;
  if (!/\bkhoang cach\b[\s\S]{0,120}\bbang\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const fixedPoint = extractCoordinatePoints(beforeOptions)[0];
  if (!fixedPoint) return undefined;
  const targetDistanceSquared = extractTargetDistanceSquared(beforeOptions);
  if (targetDistanceSquared === undefined) return undefined;

  const isXAxis = /\b(?:truc hoanh|ox)\b/.test(search);
  const variableBase = isXAxis ? fixedPoint.x : fixedPoint.y;
  const fixedOffset = isXAxis ? fixedPoint.y : fixedPoint.x;
  const remaining = targetDistanceSquared - fixedOffset * fixedOffset;
  if (remaining < -1e-8) return undefined;
  const roots = Math.abs(remaining) <= 1e-8 ? [variableBase] : [variableBase - Math.sqrt(remaining), variableBase + Math.sqrt(remaining)];
  if (roots.some((root) => !Number.isFinite(root))) return undefined;
  const points = uniqueCoordinatePoints(roots.map((root) => isXAxis ? { x: root, y: 0 } : { x: 0, y: root }));
  const answer = selectMatchingPointSetOption(parsed, points);
  if (!answer) return undefined;

  return {
    answer,
    solution: [
      `Cach quan sat: diem can tim nam tren ${isXAxis ? 'truc hoanh' : 'truc tung'} nen ${isXAxis ? 'y = 0' : 'x = 0'}, bai toan con lai la phuong trinh khoang cach.`,
      `Goi diem can tim la ${isXAxis ? 'M(x; 0)' : 'M(0; y)'}. Dung cong thuc khoang cach den ${fixedPoint.label || 'diem da cho'}(${formatNumber(fixedPoint.x)}; ${formatNumber(fixedPoint.y)}) va binh phuong hai ve.`,
      `Giai ra cac toa do ung vien: ${formatPointList(points)}.`,
      `Phuong an ${answer} liệt kê đúng các điểm này, nên chọn ${answer}.`,
      'Bay can tranh: khi binh phuong khoang cach thuong co hai diem doi xung; khong bo sot nghiem thu hai.',
    ].join(' '),
    kind: 'oxy_axis_distance_point_solver',
    confidence: 0.9,
  };
}

function solveOxyLinePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  if (!topicId.includes('coordinate_plane_oxy') && !patternId.includes('oxy.line')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\b(?:duong thang|giao diem|truc hoanh|truc tung|trung truc|song song)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const points = extractCoordinatePoints(beforeOptions);
  const optionEquations = parsed.options.map((option) => ({ option, equation: parseLinearEquation(option.text) }));
  const promptEquations = extractLinearEquations(beforeOptions);

  if (/\btrung truc\b/.test(search) && points.length >= 2) {
    const [first, second] = points;
    if (first && second) {
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const matches = optionEquations.filter((entry) => {
        const equation = entry.equation;
        if (!equation) return false;
        return pointSatisfiesLine(midpoint, equation)
          && Math.abs(equation.a * dy - equation.b * dx) <= 1e-8;
      });
      if (matches.length === 1) {
        const answer = matches[0].option.key;
        return buildOxyLineSolution(
          answer,
          'oxy_perpendicular_bisector_equation_solver',
          [
            'Cach quan sat: duong trung truc cua AB di qua trung diem cua AB va vuong goc voi AB.',
            `Trung diem la M(${formatNumber(midpoint.x)}; ${formatNumber(midpoint.y)}); vec-to AB = (${formatNumber(dx)}; ${formatNumber(dy)}).`,
            `Thay M vao cac phuong trinh va kiem tra vec-to phap tuyen song song voi AB, chi lua chon ${answer} thoa man.`,
          ],
        );
      }
    }
  }

  if (/\bsong song\b/.test(search) && points.length >= 1 && promptEquations.length === 1) {
    const point = points[0];
    const baseEquation = promptEquations[0];
    if (point && baseEquation) {
      const matches = optionEquations.filter((entry) => {
        const equation = entry.equation;
        return Boolean(equation && linesAreParallel(equation, baseEquation) && pointSatisfiesLine(point, equation));
      });
      if (matches.length === 1) {
        const answer = matches[0].option.key;
        return buildOxyLineSolution(
          answer,
          'oxy_parallel_line_through_point_solver',
          [
            'Cach quan sat: duong thang can tim song song voi duong thang da cho nen co vec-to phap tuyen cung phuong.',
            `Giu bo he so phap tuyen song song, roi thay diem ${point.label || 'M'}(${formatNumber(point.x)}; ${formatNumber(point.y)}) vao tung phuong trinh lua chon.`,
            `Chi lua chon ${answer} vua song song voi duong thang da cho vua di qua diem do, nen chon ${answer}.`,
          ],
        );
      }
    }
  }

  if (/\bsong song\b/.test(search) && /\bduong phan giac\b/.test(search) && /\bthu nhat\b/.test(search) && points.length >= 1) {
    const point = points[0];
    if (point) {
      const matches = optionEquations.filter((entry) => {
        const equation = entry.equation;
        return Boolean(equation && lineIsParallelToFirstQuadrantBisector(equation) && pointSatisfiesLine(point, equation));
      });
      if (matches.length === 1) {
        const answer = matches[0].option.key;
        return buildOxyLineSolution(
          answer,
          'oxy_line_parallel_first_quadrant_bisector_solver',
          [
            'Cach quan sat: duong phan giac goc phan tu thu nhat co phuong trinh y = x, nen duong song song voi no co dang x - y + c = 0.',
            `Thay diem ${point.label || 'M'}(${formatNumber(point.x)}; ${formatNumber(point.y)}) vao cac phuong trinh dang song song y = x.`,
            `Chi lua chon ${answer} vua song song voi y = x vua di qua diem do, nen chon ${answer}.`,
          ],
        );
      }
    }
  }

  if (/\b(?:qua hai diem|di qua hai diem|qua 2 diem|di qua 2 diem)\b/.test(search) && points.length >= 2) {
    const [first, second] = points;
    if (first && second) {
      const matches = optionEquations.filter((entry) => {
        const equation = entry.equation;
        return Boolean(equation && pointSatisfiesLine(first, equation) && pointSatisfiesLine(second, equation));
      });
      if (matches.length === 1) {
        const answer = matches[0].option.key;
        return buildOxyLineSolution(
          answer,
          'oxy_line_through_two_points_solver',
          [
            'Cach quan sat: phuong trinh tong quat ax + by + c = 0 dung khi thay toa do moi diem thuoc duong thang vao thi ve trai bang 0.',
            `Kiem tra hai diem ${first.label || 'A'}(${formatNumber(first.x)}; ${formatNumber(first.y)}) va ${second.label || 'B'}(${formatNumber(second.x)}; ${formatNumber(second.y)}) trong tung lua chon.`,
            `Chi phuong trinh o lua chon ${answer} cho ket qua 0 voi ca hai diem, nen chon ${answer}.`,
          ],
        );
      }
    }
  }

  const asksForIntersection = /\bgiao diem\b/.test(search) || /\bgiao voi\b/.test(search);
  if (asksForIntersection && /\b(?:truc hoanh|ox)\b/.test(search) && promptEquations.length === 1) {
    const point = solveLineAxisIntersection(promptEquations[0], 'x');
    const answer = point ? selectMatchingPointOption(parsed, point) : undefined;
    if (point && answer) {
      return buildOxyLineSolution(
        answer,
        'oxy_line_x_axis_intersection_solver',
        [
          'Cach quan sat: giao voi truc hoanh Ox thi tung do y = 0.',
          `Thay y = 0 vao phuong trinh duong thang, tim duoc giao diem (${formatNumber(point.x)}; 0).`,
          `Lua chon ${answer} khop toa do nay, nen chon ${answer}.`,
        ],
      );
    }
  }

  if (asksForIntersection && /\b(?:truc tung|oy)\b/.test(search) && promptEquations.length === 1) {
    const point = solveLineAxisIntersection(promptEquations[0], 'y');
    const answer = point ? selectMatchingPointOption(parsed, point) : undefined;
    if (point && answer) {
      return buildOxyLineSolution(
        answer,
        'oxy_line_y_axis_intersection_solver',
        [
          'Cach quan sat: giao voi truc tung Oy thi hoanh do x = 0.',
          `Thay x = 0 vao phuong trinh duong thang, tim duoc giao diem (0; ${formatNumber(point.y)}).`,
          `Lua chon ${answer} khop toa do nay, nen chon ${answer}.`,
        ],
      );
    }
  }

  if (/\bgiao diem\b/.test(search) && promptEquations.length >= 2) {
    const point = solveLinearSystem(promptEquations[0], promptEquations[1]);
    const answer = point ? selectMatchingPointOption(parsed, point) : undefined;
    if (point && answer) {
      return buildOxyLineSolution(
        answer,
        'oxy_two_line_intersection_solver',
        [
          'Cach quan sat: giao diem cua hai duong thang la nghiem chung cua he hai phuong trinh duong thang.',
          `Giai he ax + by + c = 0 thu duoc diem (${formatNumber(point.x)}; ${formatNumber(point.y)}).`,
          `Lua chon ${answer} co dung toa do do, nen chon ${answer}.`,
        ],
      );
    }
  }

  return undefined;
}

function buildOxyLineSolution(answer: string, kind: string, parts: string[]): Math10AutoSolution {
  return {
    answer,
    solution: [
      ...parts,
      'Bay can tranh: voi phuong trinh tong quat, can thay ca x va y vao de kiem tra; khong chon theo dang nhin giong he so.',
    ].join(' '),
    kind,
    confidence: 0.9,
  };
}

function solveLinearInequalityFormPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  const search = normalizeSearchText(prompt);
  if (!topicId.includes('linear_inequalities_two_variables') && !patternId.includes('ineq2')) return undefined;
  if (!/\bbat phuong\b.{0,80}\bbac nhat hai an\b/.test(search)) return undefined;
  if (!/\b(?:nao sau day|cau nao|phuong trinh nao|bat phuong nao)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const asksForInvalid = /\b(?:khong phai|khong la)\b.{0,80}\bbat phuong\b/.test(search);
  const classified = parsed.options.map((option) => ({
    option,
    isLinearTwoVariableInequality: isFirstDegreeTwoVariableInequality(option.text),
  }));
  const matches = classified.filter((entry) => entry.isLinearTwoVariableInequality === !asksForInvalid);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  const details = classified.map((entry) => `${entry.option.key}: ${entry.isLinearTwoVariableInequality ? 'bac nhat hai an' : 'khong dat dieu kien bac nhat hai an'}.`);
  return {
    answer,
    solution: [
      'Cach quan sat: bat phuong trinh bac nhat hai an co dang ax + by + c > 0, >= 0, < 0 hoac <= 0, trong do chi co hai an x, y va khong co mu bac hai.',
      ...details,
      asksForInvalid
        ? `Chi phuong an ${answer} khong phai dang bac nhat hai an theo yeu cau, nen chon ${answer}.`
        : `Chi phuong an ${answer} la bat phuong trinh bac nhat hai an, nen chon ${answer}.`,
      'Bay can tranh: thay x^2, y^2, xy hoac bien z la khong con la bac nhat hai an.',
    ].join(' '),
    kind: asksForInvalid ? 'ineq2_non_linear_form_choice_solver' : 'ineq2_linear_form_choice_solver',
    confidence: 0.9,
  };
}

function solveLinearInequalityPointPrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  const patternId = String(item.metadata?.patternId || '');
  const search = normalizeSearchText(prompt);
  if (!topicId.includes('linear_inequalities_two_variables') && !patternId.includes('ineq2') && !search.includes('mien nghiem')) return undefined;
  if (!/\b(?:mien nghiem|nua mat phang|thuoc mien)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  if (parsed.options.some((option) => hasTrailingInequalityInPointOption(option.text))) return undefined;
  const optionPoints = parsed.options.map((option) => ({ option, point: extractCoordinatePoints(option.text)[0] }));
  if (optionPoints.some((entry) => !entry.point)) return undefined;

  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const evaluators = extractLinearInequalityEvaluators(beforeOptions);
  if (!evaluators.length || evaluators.length > 3) return undefined;

  const matches = optionPoints.filter((entry) => {
    const point = entry.point;
    if (!point) return false;
    return evaluators.every((evaluator) => evaluator.evaluate({ x: point.x, y: point.y }) === true);
  });
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  const point = matches[0].point;
  if (!point) return undefined;
  return {
    answer,
    solution: [
      'Cach quan sat: de kiem tra mot diem co thuoc mien nghiem cua bat phuong trinh/hay he bat phuong trinh hai an, thay toa do diem do vao tung bat phuong trinh.',
      `Voi lua chon ${answer}, thay x = ${formatNumber(point.x)}, y = ${formatNumber(point.y)} thi tat ca bat phuong trinh deu dung.`,
      `Cac lua chon con lai co it nhat mot bat phuong trinh khong thoa, nen chon ${answer}.`,
      'Bay can tranh: khong nhin vi tri diem theo cam tinh khi de khong co hinh; hay thay toa do vao dau bat dang thuc.',
    ].join(' '),
    kind: evaluators.length > 1 ? 'ineq2_system_point_membership_solver' : 'ineq2_halfplane_point_solver',
    confidence: 0.9,
  };
}

function solveOpenSentenceValuePrompt(item: QuestionItem, prompt: string): Math10AutoSolution | undefined {
  const topicId = String(item.metadata?.topicId || '');
  if (!topicId.includes('logic_sets')) return undefined;
  const search = normalizeSearchText(prompt);
  if (!/\b(?:menh de chua bien|p\s*\(|p\s*:|p\s*")/.test(search)) return undefined;
  if (!/\b(?:gia tri|cap gia tri|bo gia tri|tro thanh|dung voi gia tri|de menh de)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed || hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const formula = extractPredicateFormula(prompt, parsed.optionStart);
  const evaluator = formula ? buildFormulaEvaluator(formula) : undefined;
  if (!formula || !evaluator) return undefined;
  const solvedFormula: string = formula;

  const target = /\b(?:menh de sai|la menh de sai|tro thanh mot menh de sai|de menh de p.*sai|p.*la menh de sai)\b/.test(search)
    ? false
    : true;
  const optionAssignments = parsed.options.map((option) => ({
    option,
    assignments: parseOptionAssignments(option.text, evaluator.variables),
  }));
  if (optionAssignments.some((entry) => !entry.assignments.length)) return undefined;

  const sameSingleVariable = evaluator.variables.length === 1
    && optionAssignments.every((entry) => entry.assignments.every((assignment) => Object.keys(assignment).length === 1));
  if (sameSingleVariable && optionAssignments.some((entry) => entry.assignments.length > 1)) {
    const variable = evaluator.variables[0];
    if (!variable) return undefined;
    const allValues = uniqueNumbers(optionAssignments.flatMap((entry) => entry.assignments.map((assignment) => Number(assignment[variable]))));
    const targetValues = allValues.filter((value) => evaluator.evaluate({ [variable]: value }) === target);
    const match = optionAssignments.find((entry) => {
      const values = uniqueNumbers(entry.assignments.map((assignment) => Number(assignment[variable])));
      return sameNumberSet(values, targetValues);
    });
    if (!match || targetValues.length === 0) return undefined;
    return buildOpenSentenceAutoSolution(match.option.key, solvedFormula, evaluator.variables, target, match.assignments, 'logic_open_sentence_solution_set_solver');
  }

  const matches = optionAssignments.filter((entry) => {
    const assignment = entry.assignments[0];
    return entry.assignments.length === 1 && Boolean(assignment) && evaluator.evaluate(assignment) === target;
  });
  if (matches.length !== 1) return undefined;
  const onlyMatch = matches[0];
  if (!onlyMatch) return undefined;
  return buildOpenSentenceAutoSolution(onlyMatch.option.key, solvedFormula, evaluator.variables, target, onlyMatch.assignments, 'logic_open_sentence_value_solver');
}

function solveFiniteSubsetCountPrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const finiteSet = extractFirstFiniteSet(beforeOptions);
  if (!finiteSet) return undefined;
  const n = finiteSet.elements.length;

  const exactMatch = search.match(/co bao nhieu\s+tap(?: hop)?\s+con\s+co dung\s+([a-z0-9]+)\s+phan tu/);
  if (exactMatch?.[1]) {
    const k = parseSmallNumberToken(exactMatch[1]);
    if (typeof k !== 'number' || k < 0 || k > n) return undefined;
    const count = combination(n, k);
    const answer = findNumericChoice(parsed.options, count);
    if (!answer) return undefined;
    return {
      answer,
      solution: [
        `Cach quan sat: tap ${finiteSet.name || 'da cho'} co ${n} phan tu, yeu cau chon tap con dung ${k} phan tu.`,
        `So tap con dung ${k} phan tu la C(${n}, ${k}) = ${count}.`,
        `Trong cac lua chon, ${answer} la ${count}, nen chon ${answer}.`,
        'Bay can tranh: day khong phai so phan tu cua tap A, ma la so cach chon phan tu de tao tap con.',
      ].join(' '),
      kind: 'set_subset_exact_size_count_solver',
      confidence: 0.92,
    };
  }

  if (/\bso\s+tap\s+con\s+khac\s+rong\b/.test(search)) {
    const count = (2 ** n) - 1;
    const answer = findNumericChoice(parsed.options, count);
    if (!answer) return undefined;
    return {
      answer,
      solution: [
        `Cach quan sat: tap ${finiteSet.name || 'da cho'} co ${n} phan tu nen co tong cong 2^${n} tap con.`,
        `Bo tap rong ra thi con 2^${n} - 1 = ${count} tap con khac rong.`,
        `Vay chon ${answer}.`,
        'Bay can tranh: neu de hoi "khac rong" thi phai tru di tap rong.',
      ].join(' '),
      kind: 'set_nonempty_subset_count_solver',
      confidence: 0.92,
    };
  }

  if (/\b(?:tim\s+so\s+tap\s+con|so\s+tap\s+con\s+cua\s+tap)\b/.test(search) && !/\b(?:khac rong|co dung)\b/.test(search)) {
    const count = 2 ** n;
    const answer = findNumericChoice(parsed.options, count);
    if (!answer) return undefined;
    return {
      answer,
      solution: [
        `Cach quan sat: tap ${finiteSet.name || 'da cho'} co ${n} phan tu.`,
        `Mot tap co ${n} phan tu thi co 2^${n} = ${count} tap con, tinh ca tap rong va chinh no.`,
        `Trong cac lua chon, ${answer} la ${count}, nen chon ${answer}.`,
        'Bay can tranh: neu de khong noi "khac rong" thi phai dem ca tap rong.',
      ].join(' '),
      kind: 'set_total_subset_count_solver',
      confidence: 0.92,
    };
  }

  return undefined;
}

function solveSetBuilderEmptinessChoicePrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  const asksForEmpty = /\btap nao\b.{0,80}\b(?:tap rong|rong)\b/.test(search) && !/\bkhac rong\b/.test(search);
  const asksForNonEmpty = /\btap nao\b.{0,80}\bkhac rong\b/.test(search);
  if (!asksForEmpty && !asksForNonEmpty) return undefined;

  const classified = parsed.options.map((option) => {
    const builder = parseSetBuilderEquation(option.text);
    const hasSolution = builder ? setBuilderEquationHasSolution(builder) : undefined;
    return { option, builder, hasSolution };
  });
  if (classified.some((entry) => entry.hasSolution === undefined)) return undefined;

  const targetHasSolution = asksForNonEmpty;
  const matches = classified.filter((entry) => entry.hasSolution === targetHasSolution);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  const details = classified.map((entry) => {
    const builder = entry.builder as SetBuilderEquation;
    return `${entry.option.key}: tren ${builder.domainText}, phuong trinh ${builder.equationText} ${entry.hasSolution ? 'co nghiem' : 'khong co nghiem'} nen tap ${entry.hasSolution ? 'khac rong' : 'rong'}.`;
  });
  return {
    answer,
    solution: [
      'Cach quan sat: tap dang {x thuoc mien | dieu kien} rong khi dieu kien khong co nghiem nao trong mien dang xet.',
      ...details,
      asksForNonEmpty
        ? `Chi phuong an ${answer} cho tap khac rong, nen chon ${answer}.`
        : `Chi phuong an ${answer} cho tap rong, nen chon ${answer}.`,
      'Bay can tranh: phai xet dung mien so; nghiem thuc chua chac la nghiem nguyen hay huu ti.',
    ].join(' '),
    kind: asksForNonEmpty ? 'set_builder_nonempty_choice_solver' : 'set_builder_empty_choice_solver',
    confidence: 0.89,
  };
}

function solveBasicSetRelationPrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  if (/\bcho x la mot phan tu cua tap hop\b/.test(search) && /\btrong cac menh de tren\b/.test(search)) {
    const match = parsed.options.find((option) => normalizeSearchText(option.text).includes('i va iv'));
    if (!match) return undefined;
    return {
      answer: match.key,
      solution: [
        'Cach quan sat: x la phan tu cua A nen x ∈ A la dung.',
        'Tap {x} co phan tu duy nhat la x; vi x ∈ A nen moi phan tu cua {x} deu thuoc A, suy ra {x} ⊂ A.',
        `Hai menh de dung la I va IV, nen chon ${match.key}.`,
        'Bay can tranh: {x} la mot tap hop, khong phai phan tu x; do do {x} ∈ A khong suy ra tu x ∈ A.',
      ].join(' '),
      kind: 'set_singleton_subset_relation_solver',
      confidence: 0.9,
    };
  }

  if ((/\bE\s*⊂\s*F\b/.test(prompt) && /\bF\s*⊂\s*G\b/.test(prompt) && /\bG\s*⊂\s*E\b/.test(prompt))
    || (/\be la tap con f\b/.test(search) && /\bf la tap con g\b/.test(search) && /\bg la tap con e\b/.test(search))) {
    const match = parsed.options.find((option) => /E\s*=\s*F\s*=\s*G/i.test(option.text));
    if (!match) return undefined;
    return {
      answer: match.key,
      solution: [
        'Cach quan sat: E ⊂ F, F ⊂ G va G ⊂ E tao thanh vong bao ham hai chieu.',
        'Suy ra moi tap vua chua trong tap kia, vua duoc tap kia chua lai; vi vay ba tap bang nhau.',
        `Do do E = F = G, chon ${match.key}.`,
        'Bay can tranh: khi co ca chuoi bao ham quay lai tap ban dau, khong ket luan cac tap khac nhau.',
      ].join(' '),
      kind: 'set_mutual_inclusion_equality_solver',
      confidence: 0.91,
    };
  }

  return undefined;
}

function solveFiniteSetOperationChoicePrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const namedSets = parseNamedFiniteSets(beforeOptions);
  if (Object.keys(namedSets).length < 2) return undefined;
  const operation = extractFiniteSetOperation(beforeOptions);
  if (!operation) return undefined;
  const left = namedSets[operation.left];
  const right = namedSets[operation.right];
  if (!left || !right) return undefined;

  let result: string[];
  let operationText: string;
  if (operation.operator === 'union') {
    result = uniqueStrings([...left, ...right]).sort(compareSetElements);
    operationText = 'hop';
  } else if (operation.operator === 'intersection') {
    result = left.filter((value) => right.includes(value)).sort(compareSetElements);
    operationText = 'giao';
  } else {
    result = left.filter((value) => !right.includes(value)).sort(compareSetElements);
    operationText = 'hieu';
  }

  const matches = parsed.options.filter((option) => {
    const values = parseFiniteSetLiteral(option.text);
    return values ? sameStringSet(values.sort(compareSetElements), result) : false;
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].key;
  const trapText = operation.operator === 'union'
    ? 'Bay can tranh: hop hai tap khong dem lap phan tu chung; moi phan tu chi viet mot lan.'
    : operation.operator === 'intersection'
      ? 'Bay can tranh: giao chi lay phan tu chung cua ca hai tap, khong lay phan tu chi thuoc mot tap.'
      : 'Bay can tranh: voi A \\ B, thu tu rat quan trong; A \\ B khac B \\ A.';
  return {
    answer,
    solution: [
      `Cach quan sat: can tinh ${operation.left} ${operation.operator === 'union' ? '∪' : operation.operator === 'intersection' ? '∩' : '\\'} ${operation.right}.`,
      operation.operator === 'union'
        ? `Hop lay tat ca phan tu thuoc ${operation.left} hoac ${operation.right}; ket qua la {${result.join('; ')}}.`
        : operation.operator === 'intersection'
          ? `Giao lay cac phan tu chung cua ca hai tap; ket qua la {${result.join('; ')}}.`
          : `Hieu lay cac phan tu thuoc ${operation.left} nhung khong thuoc ${operation.right}; ket qua la {${result.join('; ')}}.`,
      `Lua chon ${answer} dung ket qua phep ${operationText}, nen chon ${answer}.`,
      trapText,
    ].join(' '),
    kind: `set_finite_${operation.operator}_operation_solver`,
    confidence: 0.91,
  };
}

function solveFiniteSetChoiceBySubsetTotalPrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  const match = search.match(/tap nao co dung\s+([a-z0-9]+)\s+tap(?: hop)?\s+con/);
  if (!match?.[1]) return undefined;
  const target = parseSmallNumberToken(match[1]);
  if (typeof target !== 'number' || target <= 0) return undefined;

  const classified = parsed.options.map((option) => ({
    option,
    elements: parseFiniteSetLiteral(option.text),
  }));
  if (classified.some((entry) => !entry.elements)) return undefined;
  const matches = classified.filter((entry) => {
    const size = entry.elements?.length || 0;
    return 2 ** size === target;
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].option.key;
  return {
    answer,
    solution: [
      'Cach quan sat: mot tap co n phan tu thi co 2^n tap con.',
      ...classified.map((entry) => `${entry.option.key}: co ${entry.elements?.length || 0} phan tu nen co ${2 ** (entry.elements?.length || 0)} tap con.`),
      `Chi lua chon ${answer} co dung ${target} tap con, nen chon ${answer}.`,
      'Bay can tranh: tap rong co 0 phan tu nhung co 1 tap con, chinh la tap rong.',
    ].join(' '),
    kind: 'set_choice_by_subset_total_solver',
    confidence: 0.91,
  };
}

function solveFiniteSetBetweenCountPrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const setA = extractNamedFiniteSet(beforeOptions, 'A');
  const setB = extractNamedFiniteSet(beforeOptions, 'B');
  if (!setA || !setB) return undefined;

  if (/A\s*[⊂⊆]\s*X\s*[⊂⊆]\s*B/i.test(beforeOptions)) {
    if (!isSubset(setA, setB)) return undefined;
    const flexible = setB.filter((value) => !setA.includes(value));
    const count = 2 ** flexible.length;
    const answer = findNumericChoice(parsed.options, count);
    if (!answer) return undefined;
    return {
      answer,
      solution: [
        `Cach quan sat: A da nam trong X va X nam trong B, nen chi duoc tuy chon cac phan tu thuoc B nhung khong thuoc A.`,
        `B \\ A co ${flexible.length} phan tu, moi phan tu co 2 kha nang: chon hoac khong chon vao X.`,
        `Vi vay co 2^${flexible.length} = ${count} tap X. Chon ${answer}.`,
        'Bay can tranh: o day ky hieu tap con trong nguon lop 10 duoc dung theo nghia co the bang; khong loai A va B neu de khong noi "tap con thuc su".',
      ].join(' '),
      kind: 'set_between_finite_sets_count_solver',
      confidence: 0.9,
    };
  }

  if (/X\s*[⊂⊆]\s*A\b.{0,45}X\s*[⊂⊆]\s*B/i.test(beforeOptions)) {
    const common = setA.filter((value) => setB.includes(value));
    const count = 2 ** common.length;
    const answer = findNumericChoice(parsed.options, count);
    if (!answer) return undefined;
    return {
      answer,
      solution: [
        'Cach quan sat: X dong thoi la tap con cua A va cua B, nen X phai la tap con cua A giao B.',
        `A giao B co ${common.length} phan tu, nen co 2^${common.length} = ${count} tap con co the chon lam X.`,
        `Vay chon ${answer}.`,
        'Bay can tranh: khong dem rieng tap con cua A roi tap con cua B; dieu kien "va" buoc X nam trong phan chung.',
      ].join(' '),
      kind: 'set_common_subset_count_solver',
      confidence: 0.9,
    };
  }

  return undefined;
}

function solveCommonDivisorSetListingPrompt(prompt: string, parsed: ChoiceParseResult): Math10AutoSolution | undefined {
  const beforeOptions = prompt.slice(0, parsed.optionStart);
  const search = normalizeSearchText(beforeOptions);
  const match = search.match(/uoc chung cua\s*(\d+)\s*va\s*(\d+)/);
  if (!match?.[1] || !match[2] || !/\bliet ke\b/.test(search)) return undefined;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) return undefined;
  const divisors = positiveDivisors(gcd(a, b));
  const matches = parsed.options.filter((option) => {
    const values = parseNumericFiniteSetLiteral(option.text);
    return values ? sameNumberSet(values, divisors) : false;
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].key;
  return {
    answer,
    solution: [
      `Cach quan sat: uoc chung cua ${a} va ${b} chinh la uoc cua UCLN(${a}, ${b}).`,
      `UCLN(${a}, ${b}) = ${gcd(a, b)}, cac uoc duong la ${divisors.join('; ')}.`,
      `Lua chon ${answer} liet ke dung cac phan tu nay, nen chon ${answer}.`,
      'Bay can tranh: khong tron uoc cua tung so voi uoc chung; phai lay nhung so chia het cho ca hai so.',
    ].join(' '),
    kind: 'set_common_divisor_listing_solver',
    confidence: 0.91,
  };
}

function solvePropositionCountPrompt(prompt: string): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  if (!/\bco bao nhieu\b.{0,80}\b(?:menh de|khang dinh co tinh dung sai)\b/.test(search)) return undefined;
  if (/\b(?:menh de dung|menh de sai)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed) return undefined;
  if (hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const statements = extractStatementsBeforeChoices(prompt, parsed.optionStart);
  if (statements.length < 2 || statements.length > 8) return undefined;

  const classified = statements.map((statement) => ({
    statement,
    classification: classifyProposition(statement.text),
  }));
  if (classified.some((entry) => !entry.classification)) return undefined;

  const asksForNonPropositionCount = /\bco bao nhieu\b.{0,120}\b(?:khong phai la menh de|khong phai menh de|khong la menh de)\b/.test(search);
  const targetCount = classified.filter((entry) => asksForNonPropositionCount
    ? !entry.classification?.value
    : entry.classification?.value).length;
  const answer = findNumericChoice(parsed.options, targetCount);
  if (!answer) return undefined;

  return {
    answer,
    solution: buildPropositionCountSolution(
      classified as Array<{ statement: NumberedStatement; classification: PropositionClassification }>,
      targetCount,
      answer,
      asksForNonPropositionCount,
    ),
    kind: asksForNonPropositionCount ? 'logic_non_proposition_count_solver' : 'logic_proposition_count_solver',
    confidence: 0.9,
  };
}

function solvePropositionChoicePrompt(prompt: string): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  if (!/\bcau nao\b.{0,100}\bmenh de\b/.test(search)) return undefined;
  if (/\b(?:menh de dung|menh de sai|dung nhat|sai nhat)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed) return undefined;
  if (hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const asksForNonProposition = /\b(?:khong phai la menh de|khong phai menh de|khong la menh de)\b/.test(search);
  const asksForProposition = !asksForNonProposition && /\b(?:la mot menh de|la menh de)\b/.test(search);
  if (!asksForNonProposition && !asksForProposition) return undefined;

  const classified = parsed.options.map((option) => ({
    option,
    classification: classifyProposition(option.text),
  }));
  if (classified.some((entry) => !entry.classification)) return undefined;

  const target = asksForNonProposition ? false : true;
  const matches = classified.filter((entry) => entry.classification?.value === target);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  return {
    answer,
    solution: buildPropositionChoiceSolution(classified as Array<{ option: ChoiceOption; classification: PropositionClassification }>, target, answer),
    kind: asksForNonProposition ? 'logic_non_proposition_choice_solver' : 'logic_proposition_choice_solver',
    confidence: 0.89,
  };
}

function solveReferencedPropositionChoicePrompt(prompt: string): Math10AutoSolution | undefined {
  const search = normalizeSearchText(prompt);
  if (!/\bcau nao\b.{0,100}\bmenh de\b/.test(search)) return undefined;
  if (/\b(?:menh de dung|menh de sai|dung nhat|sai nhat)\b/.test(search)) return undefined;

  const parsed = parseChoiceOptions(prompt);
  if (!parsed) return undefined;
  if (hasUnsafeAutoPrompt(prompt, parsed)) return undefined;
  const asksForNonProposition = /\b(?:khong phai la menh de|khong phai menh de|khong la menh de)\b/.test(search);
  const asksForProposition = !asksForNonProposition && /\b(?:la mot menh de|la menh de)\b/.test(search);
  if (!asksForNonProposition && !asksForProposition) return undefined;

  const statements = extractStatementsBeforeChoices(prompt, parsed.optionStart);
  if (statements.length < 2 || statements.length > 8) return undefined;
  const statementByLabel = new Map(statements.map((statement) => [normalizeStatementLabel(statement.label), statement]));
  const referenced = parsed.options.map((option) => {
    const label = extractReferencedStatementLabel(option.text);
    const statement = label ? statementByLabel.get(label) : undefined;
    const classification = statement ? classifyProposition(statement.text) : undefined;
    return { option, label, statement, classification };
  });
  if (referenced.some((entry) => !entry.label || !entry.statement || !entry.classification)) return undefined;

  const target = asksForNonProposition ? false : true;
  const matches = referenced.filter((entry) => entry.classification?.value === target);
  if (matches.length !== 1) return undefined;

  const answer = matches[0].option.key;
  const details = referenced.map((entry) => {
    const statement = entry.statement as NumberedStatement;
    const classification = entry.classification as PropositionClassification;
    return `${entry.option.key} dan toi ${statement.label} "${statement.text}": ${classification.value ? 'la menh de' : 'khong phai menh de'} vi ${classification.reason}.`;
  });
  return {
    answer,
    solution: [
      'Cach quan sat: dap an chi ghi a), b), c), d) nen phai quay lai phan liet ke ban dau, khong duoc phan loai rieng chu cai trong phuong an.',
      ...details,
      asksForNonProposition
        ? `Chi lua chon ${answer} tro den cau khong co gia tri dung/sai xac dinh, nen chon ${answer}.`
        : `Chi lua chon ${answer} tro den cau khang dinh co the xet dung/sai, nen chon ${answer}.`,
      'Bay can tranh: cau hoi/cau cau khien khong phai menh de; mot cau khang dinh co the sai van la menh de.',
    ].join(' '),
    kind: asksForNonProposition ? 'logic_referenced_non_proposition_choice_solver' : 'logic_referenced_proposition_choice_solver',
    confidence: 0.9,
  };
}

function normalizeStatementLabel(value: string): string {
  return normalizeSearchText(String(value || '').replace(/[).]/g, '').trim());
}

function extractReferencedStatementLabel(value: string): string | undefined {
  const match = normalizeInline(value).match(/^\s*([a-h])\s*\)\s*\.?\s*$/i);
  return match?.[1] ? normalizeStatementLabel(match[1]) : undefined;
}

interface NumberedStatement {
  label: string;
  text: string;
}

function extractStatementsBeforeChoices(prompt: string, optionStart: number): NumberedStatement[] {
  const body = prompt.slice(0, optionStart);
  let work = body;
  const questionMark = work.indexOf('?');
  if (questionMark >= 0) {
    work = work.slice(questionMark + 1);
  } else {
    const colon = work.indexOf(':');
    if (colon >= 0) work = work.slice(colon + 1);
  }

  const marked = work.replace(/(^|\s)([a-h]\))/gi, '\n$2 ');
  const rawLines = marked
    .split(/\n+/)
    .map((line) => normalizeInline(line))
    .filter(Boolean);

  const statements: NumberedStatement[] = [];
  rawLines.forEach((line, index) => {
    if (/^[A-D]\./.test(line)) return;
    const bullet = line.match(/^([a-h]\))\s*(.+)$/i);
    const text = normalizeInline(bullet ? bullet[2] : line);
    if (!text || text.length < 3) return;
    if (/^(?:cau|bai)\s*\d+\b/i.test(normalizeSearchText(text))) return;
    statements.push({
      label: bullet ? bullet[1] : String(index + 1),
      text,
    });
  });

  return statements.slice(0, 8);
}

function classifyProposition(statement: string): PropositionClassification | undefined {
  const clean = normalizeInline(statement.replace(/^[a-h]\)\s*/i, ''));
  const search = normalizeSearchText(clean);
  if (!search || search.length < 2) return undefined;

  if (/[?]/.test(clean)
    || /\bco\b.{0,80}\bkhong\b/.test(search)
    || /\b(?:bao nhieu|the nao|cau nao|ban nao|o dau|khi nao|tai sao|vi sao|may|nao|ai)\b/.test(search)) {
    return { value: false, reason: 'cau hoi nen chua co gia tri dung/sai xac dinh' };
  }

  if (/\b(?:hay|di ngu|co len|dung|khong duoc|cam)\b/.test(search) || /!/.test(clean)) {
    return { value: false, reason: 'cau cau khien/cam than nen khong phai menh de' };
  }

  if (/\b(?:dep qua|lanh the|sap doi|xinh qua)\b/.test(search)) {
    return { value: false, reason: 'cau cam than/cam xuc khong co tinh dung sai ro rang' };
  }

  if (/[∀∃]/.test(clean)) return undefined;

  if (hasFreeVariableAssertion(search)) {
    return { value: false, reason: 'menh de chua bien chua gan gia tri/luong tu nen chua xac dinh dung sai' };
  }

  if (hasDeclarativeMathOrFactCue(search)) {
    return { value: true, reason: 'cau khang dinh co the xet dung hoac sai' };
  }

  if (/\.$/.test(clean) && clean.length >= 8 && !/\b(?:ban|em|anh|chi)\b/.test(search)) {
    return { value: true, reason: 'cau tran thuat co noi dung khang dinh' };
  }

  return undefined;
}

function hasFreeVariableAssertion(search: string): boolean {
  if (!/\b[xyzt]\b/.test(search)) return false;
  if (/\b(?:phuong trinh|bat phuong trinh|ham so|do thi|tap hop|nghiem|voi moi|ton tai)\b/.test(search)) return false;
  return /[=<>]|<=|>=/.test(search);
}

function hasDeclarativeMathOrFactCue(search: string): boolean {
  if (/\d/.test(search) && /\b(?:la|bang|khong la|nguyen to|vo ti|huu ti|vo nghiem|co nghiem|chia het|lon hon|nho hon)\b/.test(search)) return true;
  return /\b(?:la|thuoc|khong la|viet nam|trung quoc|chau a|so tu nhien|so nguyen|so nguyen to|tam giac|tu giac|hinh chu nhat|hinh thoi|hinh binh hanh|vect|phuong trinh|vo nghiem|co nghiem|nam nhuan)\b/.test(search);
}

function findNumericChoice(options: ChoiceOption[], value: number): string | undefined {
  return options.find((option) => {
    const text = normalizeInline(option.text);
    const match = text.match(/-?\d+/);
    return match ? Number(match[0]) === value : false;
  })?.key;
}

function parseSmallNumberToken(token: string): number | undefined {
  const clean = normalizeSearchText(token);
  if (/^-?\d+$/.test(clean)) return Number(clean);
  const words: Record<string, number> = {
    khong: 0,
    mot: 1,
    hai: 2,
    ba: 3,
    bon: 4,
    tu: 4,
    nam: 5,
    sau: 6,
    bay: 7,
    tam: 8,
    chin: 9,
    muoi: 10,
  };
  return words[clean];
}

function combination(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  const r = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= r; i += 1) {
    value = (value * (n - r + i)) / i;
  }
  return Math.round(value);
}

function parseSetBuilderEquation(value: string): SetBuilderEquation | undefined {
  const normalized = normalizeMathChars(value)
    .replace(/[|ï½œ]/g, '|')
    .replace(/\s+/g, ' ')
    .trim();
  if (!/\{/.test(normalized) || !/\}/.test(normalized) || !/=/.test(normalized)) return undefined;
  const domainMatch = normalized.match(/x\s*(?:∈|âˆˆ|in|\?)\s*([A-Zℕℤℚℝ]+)/i);
  const conditionMatch = normalized.match(/\|\s*([^{}]+?)\s*\}/);
  if (!domainMatch?.[1] || !conditionMatch?.[1]) return undefined;
  const domain = parseSetBuilderDomain(domainMatch[1]);
  if (!domain) return undefined;
  const equationText = normalizeInline(conditionMatch[1]);
  if (!/=/.test(equationText) || /[<>]/.test(equationText)) return undefined;
  const parts = equationText.split('=');
  if (parts.length !== 2) return undefined;
  const right = normalizeInline(parts[1] || '');
  if (!/^0\.?$/.test(right)) return undefined;
  const expression = normalizePolynomialExpression(parts[0] || '');
  if (!expression) return undefined;
  return {
    domain,
    domainText: domainMatch[1],
    equationText,
    expression,
  };
}

function parseSetBuilderDomain(value: string): SetBuilderEquation['domain'] | undefined {
  const token = normalizeInline(value).toUpperCase();
  if (token.includes('ℕ') || token === 'N') return 'N';
  if (token.includes('ℤ') || token === 'Z') return 'Z';
  if (token.includes('ℚ') || token === 'Q') return 'Q';
  if (token.includes('ℝ') || token === 'R') return 'R';
  return undefined;
}

function setBuilderEquationHasSolution(builder: SetBuilderEquation): boolean | undefined {
  const factors = extractPolynomialFactors(builder.expression);
  if (!factors.length) return polynomialHasDomainRoot(builder.expression, builder.domain);
  const factorResults = factors.map((factor) => polynomialHasDomainRoot(factor, builder.domain));
  return factorResults.some((entry) => entry === undefined) ? undefined : factorResults.some(Boolean);
}

function extractPolynomialFactors(expression: string): string[] {
  const expr = expression.replace(/\s+/g, '');
  const factors: string[] = [];
  const parenthesized = [...expr.matchAll(/\(([^()]+)\)/g)].map((match) => match[1]).filter(Boolean) as string[];
  if (parenthesized.length > 0) {
    const leading = expr.slice(0, expr.indexOf('('));
    if (leading && /x/.test(leading)) factors.push(leading);
    factors.push(...parenthesized);
    return factors;
  }
  return [];
}

function normalizePolynomialExpression(value: string): string {
  return normalizeMathChars(value)
    .replace(/−|–|—/g, '-')
    .replace(/\s+/g, '')
    .replace(/([0-9])x/g, '$1*x')
    .replace(/x([0-9]+)/g, 'x^$1')
    .replace(/\*\s*/g, '*')
    .trim();
}

function polynomialHasDomainRoot(expression: string, domain: SetBuilderEquation['domain']): boolean | undefined {
  const coefficients = parsePolynomialCoefficients(expression);
  if (!coefficients) return undefined;
  const degree = polynomialDegree(coefficients);
  if (degree <= 0) return coefficients[0] === 0;
  if (degree === 1) {
    const root = -coefficients[0] / coefficients[1];
    return numberBelongsToDomain(root, domain);
  }
  if (degree === 2) {
    const a = coefficients[2] || 0;
    const b = coefficients[1] || 0;
    const c = coefficients[0] || 0;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < -1e-9) return false;
    if (domain === 'R') return true;
    if (discriminant < 0) return false;
    const sqrt = Math.sqrt(discriminant);
    if (!isNearlyInteger(sqrt)) return false;
    return [
      (-b - sqrt) / (2 * a),
      (-b + sqrt) / (2 * a),
    ].some((root) => numberBelongsToDomain(root, domain));
  }
  const integerCandidates = getIntegerRootCandidates(coefficients[0] || 0);
  const hasIntegerRoot = integerCandidates.some((candidate) => Math.abs(evaluatePolynomial(coefficients, candidate)) <= 1e-8 && numberBelongsToDomain(candidate, domain));
  if (hasIntegerRoot) return true;
  return domain === 'R' ? undefined : false;
}

function parsePolynomialCoefficients(expression: string): number[] | undefined {
  const compact = normalizePolynomialExpression(expression);
  if (!compact || /[^0-9x^*+\-.]/.test(compact)) return undefined;
  const terms = compact.replace(/-/g, '+-').replace(/^\+/, '').split('+').filter(Boolean);
  const coefficients: number[] = [];
  for (const term of terms) {
    const parsed = parsePolynomialTerm(term);
    if (!parsed) return undefined;
    coefficients[parsed.degree] = (coefficients[parsed.degree] || 0) + parsed.coefficient;
  }
  return coefficients.map((value) => value || 0);
}

function parsePolynomialTerm(term: string): { degree: number; coefficient: number } | undefined {
  const normalizedTerm = term.replace(/^-x/, '-1*x').replace(/^\+?x/, '1*x');
  if (!normalizedTerm.includes('x')) {
    const constant = parseNumber(normalizedTerm);
    return Number.isFinite(constant) ? { degree: 0, coefficient: constant } : undefined;
  }
  const match = normalizedTerm.match(/^([+-]?\d+(?:\.\d+)?(?:\*)?)?x(?:\^(\d+))?$/);
  if (!match) return undefined;
  let coeffText = match[1] || '';
  coeffText = coeffText.replace(/\*$/, '');
  const coefficient = coeffText === '' || coeffText === '+'
    ? 1
    : coeffText === '-'
      ? -1
      : parseNumber(coeffText);
  const degree = match[2] ? Number(match[2]) : 1;
  return Number.isFinite(coefficient) && Number.isInteger(degree) ? { degree, coefficient } : undefined;
}

function polynomialDegree(coefficients: number[]): number {
  for (let degree = coefficients.length - 1; degree >= 0; degree -= 1) {
    if (Math.abs(coefficients[degree] || 0) > 1e-9) return degree;
  }
  return 0;
}

function numberBelongsToDomain(value: number, domain: SetBuilderEquation['domain']): boolean {
  if (!Number.isFinite(value)) return false;
  if (domain === 'R' || domain === 'Q') return true;
  if (!isNearlyInteger(value)) return false;
  return domain === 'N' ? value >= 0 : true;
}

function isNearlyInteger(value: number): boolean {
  return Math.abs(value - Math.round(value)) <= 1e-8;
}

function getIntegerRootCandidates(constant: number): number[] {
  const max = Math.max(20, Math.abs(Math.round(constant)));
  const candidates: number[] = [];
  for (let value = -max; value <= max; value += 1) candidates.push(value);
  return candidates;
}

function evaluatePolynomial(coefficients: number[], x: number): number {
  return coefficients.reduce((sum, coefficient, degree) => sum + coefficient * (x ** degree), 0);
}

function extractFirstFiniteSet(value: string): { name?: string; elements: string[] } | undefined {
  const named = normalizeMathChars(value).match(/\b([A-Z])\s*=\s*\{([^{}]*)\}/);
  if (named?.[2]) {
    const elements = parseFiniteSetInner(named[2]);
    if (elements) return { name: named[1], elements };
  }
  const elements = parseFiniteSetLiteral(value);
  return elements ? { elements } : undefined;
}

function extractNamedFiniteSet(value: string, name: string): string[] | undefined {
  const regex = new RegExp(`\\b${name}\\s*=\\s*\\{([^{}]*)\\}`);
  const match = normalizeMathChars(value).match(regex);
  return match?.[1] ? parseFiniteSetInner(match[1]) : undefined;
}

function parseNamedFiniteSets(value: string): Record<string, string[]> {
  const sets: Record<string, string[]> = {};
  const normalized = normalizeMathChars(value);
  for (const match of normalized.matchAll(/\b([A-Z])\s*=\s*\{([^{}]*)\}/g)) {
    const name = match[1];
    const elements = match[2] ? parseFiniteSetInner(match[2]) : undefined;
    if (name && elements) sets[name] = elements;
  }
  return sets;
}

function extractFiniteSetOperation(value: string): { left: string; right: string; operator: 'union' | 'intersection' | 'difference' } | undefined {
  const normalized = normalizeMathChars(value);
  const union = normalized.match(/\b([A-Z])\s*(?:∪|hop)\s*([A-Z])\b/i);
  if (union?.[1] && union[2]) return { left: union[1], right: union[2], operator: 'union' };
  const intersection = normalized.match(/\b([A-Z])\s*(?:∩|giao)\s*([A-Z])\b/i);
  if (intersection?.[1] && intersection[2]) return { left: intersection[1], right: intersection[2], operator: 'intersection' };
  const difference = normalized.match(/\b([A-Z])\s*\\\s*([A-Z])\b/);
  if (difference?.[1] && difference[2]) return { left: difference[1], right: difference[2], operator: 'difference' };
  return undefined;
}

function parseFiniteSetLiteral(value: string): string[] | undefined {
  const normalized = normalizeMathChars(value);
  if (/^\s*(?:∅|Ø|emptyset|tap rong)\s*\.?$/i.test(normalized) || /\btap rong\b/i.test(normalizeSearchText(normalized))) return [];
  const match = normalized.match(/\{([^{}]*)\}/);
  if (!match?.[1] && /\bemptyset\b/i.test(normalized)) return [];
  return match?.[1] !== undefined ? parseFiniteSetInner(match[1]) : undefined;
}

function parseFiniteSetInner(inner: string): string[] | undefined {
  const normalized = normalizeMathChars(inner);
  if (/[∈<>|=]/.test(normalized)) return undefined;
  if (!normalizeInline(normalized)) return [];
  const elements = normalized
    .split(/[;,]/)
    .map((part) => normalizeSetElement(part))
    .filter(Boolean);
  if (!elements.length) return undefined;
  if (elements.some((element) => /\s/.test(element))) return undefined;
  return uniqueStrings(elements);
}

function normalizeSetElement(value: string): string {
  return normalizeMathChars(value)
    .replace(/[.。]+$/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function parseNumericFiniteSetLiteral(value: string): number[] | undefined {
  const elements = parseFiniteSetLiteral(value);
  if (!elements) return undefined;
  const values = elements.map((element) => parseNumber(element));
  if (values.some((entry) => !Number.isFinite(entry))) return undefined;
  return uniqueNumbers(values);
}

function isSubset(a: string[], b: string[]): boolean {
  return a.every((value) => b.includes(value));
}

function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function compareSetElements(a: string, b: string): number {
  const left = Number(a);
  const right = Number(b);
  if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
  return a.localeCompare(b);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

function positiveDivisors(value: number): number[] {
  const divisors: number[] = [];
  for (let candidate = 1; candidate <= value; candidate += 1) {
    if (value % candidate === 0) divisors.push(candidate);
  }
  return divisors;
}

function buildPropositionCountSolution(
  classified: Array<{ statement: NumberedStatement; classification: PropositionClassification }>,
  targetCount: number,
  answer: string,
  countNonPropositions: boolean,
): string {
  const details = classified.map((entry) => {
    const verdict = entry.classification.value ? 'la menh de' : 'khong phai menh de';
    return `${entry.statement.label} ${verdict} vi ${entry.classification.reason}: "${entry.statement.text}".`;
  });
  return [
    'Cach quan sat: menh de la cau khang dinh co the xet dung hoac sai; cau hoi, cau cam than, cau cau khien hoac menh de chua bien khong tinh la menh de.',
    ...details,
    countNonPropositions
      ? `Co ${targetCount} cau khong phai la menh de, nen chon ${answer}.`
      : `Co ${targetCount} cau la menh de, nen chon ${answer}.`,
    'Bay can tranh: khong can biet cau khang dinh dung hay sai; chi can no co gia tri dung/sai xac dinh thi van la menh de.',
  ].join(' ');
}

function buildPropositionChoiceSolution(
  classified: Array<{ option: ChoiceOption; classification: PropositionClassification }>,
  target: boolean,
  answer: string,
): string {
  const details = classified.map((entry) => {
    const verdict = entry.classification.value ? 'la menh de' : 'khong phai menh de';
    return `${entry.option.key}: ${verdict} vi ${entry.classification.reason}.`;
  });
  return [
    'Cach quan sat: doc tung lua chon va hoi "cau nay co the gan dung/sai ro rang khong?".',
    ...details,
    target
      ? `Chi lua chon ${answer} la menh de theo yeu cau de bai, nen chon ${answer}.`
      : `Chi lua chon ${answer} khong phai la menh de theo yeu cau de bai, nen chon ${answer}.`,
    'Bay can tranh: khong danh dong cau sai voi "khong phai menh de"; mot cau khang dinh sai van la menh de.',
  ].join(' ');
}

interface FormulaEvaluator {
  formula: string;
  variables: string[];
  evaluate: (assignment: Record<string, number>) => boolean | undefined;
}

function extractPredicateFormula(prompt: string, optionStart: number): string | undefined {
  const beforeOptions = normalizeMathChars(prompt.slice(0, optionStart));
  const quoted = beforeOptions.match(/[Pp]\s*(?:\([^)]*\))?\s*[:：]?\s*["“](.+?)["”]/);
  if (quoted?.[1]) return normalizeInline(quoted[1]);

  const afterP = beforeOptions.match(/[Pp]\s*(?:\([^)]*\))?\s*[:：]\s*([^?]+)$/);
  if (afterP?.[1]) return normalizeInline(afterP[1]);

  const quotedRelations = [...beforeOptions.matchAll(/["“](.+?)["”]/g)]
    .map((match) => normalizeInline(match[1] || ''))
    .filter((candidate) => Boolean(splitRelation(candidate)));
  if (quotedRelations.length === 1) return quotedRelations[0];
  return undefined;
}

function buildFormulaEvaluator(formula: string): FormulaEvaluator | undefined {
  const normalized = normalizeMathChars(formula);
  if (/[∀∃⋮]|chia\s*het|nguyen to|chinh phuong/i.test(normalized)) return undefined;
  const relation = splitRelation(normalized);
  if (!relation) return undefined;
  const variables = uniqueStrings((normalized.match(/[xyz]/g) || []));
  if (!variables.length || variables.length > 3) return undefined;
  const left = compileArithmeticExpression(relation.left, variables);
  const right = compileArithmeticExpression(relation.right, variables);
  if (!left || !right) return undefined;

  return {
    formula: normalized,
    variables,
    evaluate: (assignment) => {
      if (variables.some((variable) => typeof assignment[variable] !== 'number' || !Number.isFinite(assignment[variable]))) return undefined;
      const leftValue = left(assignment);
      const rightValue = right(assignment);
      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return undefined;
      if (relation.operator === '=') return Math.abs(leftValue - rightValue) <= 1e-9;
      if (relation.operator === '>') return leftValue > rightValue;
      if (relation.operator === '<') return leftValue < rightValue;
      if (relation.operator === '>=') return leftValue >= rightValue || Math.abs(leftValue - rightValue) <= 1e-9;
      if (relation.operator === '<=') return leftValue <= rightValue || Math.abs(leftValue - rightValue) <= 1e-9;
      return undefined;
    },
  };
}

function splitRelation(value: string): { left: string; operator: string; right: string } | undefined {
  const text = normalizeMathChars(value)
    .replace(/\b(?:la|là)\s+menh\s+de\s+(?:dung|sai)\b/gi, '')
    .trim();
  const match = text.match(/^(.+?)(>=|<=|≥|≤|=|>|<)(.+)$/);
  if (!match?.[1] || !match[2] || !match[3]) return undefined;
  const operator = match[2] === '≥' ? '>=' : match[2] === '≤' ? '<=' : match[2];
  return {
    left: match[1],
    operator,
    right: match[3],
  };
}

function compileArithmeticExpression(expression: string, variables: string[]): ((assignment: Record<string, number>) => number) | undefined {
  const jsExpression = toSafeJsArithmetic(expression);
  if (!jsExpression || !/^[0-9xyz+\-*/().\s*]+$/.test(jsExpression)) return undefined;
  try {
    const fn = new Function('assignment', `const x=assignment.x; const y=assignment.y; const z=assignment.z; return (${jsExpression});`) as (assignment: Record<string, number>) => number;
    const smokeAssignment = Object.fromEntries(variables.map((variable) => [variable, 1])) as Record<string, number>;
    const smoke = fn(smokeAssignment);
    if (!Number.isFinite(smoke)) return undefined;
    return fn;
  } catch {
    return undefined;
  }
}

function toSafeJsArithmetic(expression: string): string {
  let text = normalizeMathChars(expression)
    .replace(/\s+/g, ' ')
    .replace(/\^/g, '**')
    .replace(/([xyz])\s*([2-9])\b/g, '$1**$2')
    .replace(/([0-9])\s*([xyz])/g, '$1*$2')
    .replace(/([xyz])\s*([xyz])/g, '$1*$2')
    .replace(/([0-9])\s*\(/g, '$1*(')
    .replace(/\)\s*([xyz0-9])/g, ')*$1')
    .replace(/[^0-9xyz+\-*/().\s]/g, '');
  text = text.replace(/\s+/g, '');
  return text;
}

function parseOptionAssignments(optionText: string, variables: string[]): Array<Record<string, number>> {
  const text = normalizeMathChars(optionText);
  const assignments: Array<Record<string, number>> = [];
  const explicitMatches = [...text.matchAll(/\b([xyz])\s*=\s*(-?\d+(?:[.,]\d+)?)/g)];
  if (explicitMatches.length) {
    if (variables.length === 1) {
      const variable = variables[0];
      if (!variable) return [];
      return explicitMatches
        .filter((match) => match[1] === variable && match[2])
        .map((match) => ({ [variable]: parseNumber(match[2] || '0') }))
        .filter((assignment) => Number.isFinite(assignment[variable]));
    }

    const grouped: Record<string, number> = {};
    explicitMatches.forEach((match) => {
      if (match[1] && match[2]) grouped[match[1]] = parseNumber(match[2]);
    });
    if (variables.every((variable) => typeof grouped[variable] === 'number')) {
      assignments.push(grouped);
      return assignments;
    }
  }

  if (variables.length === 1) {
    const variable = variables[0];
    if (!variable) return [];
    const values = [...text.matchAll(/-?\d+(?:[.,]\d+)?/g)].map((match) => parseNumber(match[0]));
    return values.map((value) => ({ [variable]: value }));
  }

  return assignments;
}

function buildOpenSentenceAutoSolution(
  answer: string,
  formula: string,
  variables: string[],
  target: boolean,
  assignments: Array<Record<string, number>>,
  kind: string,
): Math10AutoSolution {
  const assignmentText = assignments.map((assignment) => variables.map((variable) => `${variable} = ${formatNumber(assignment[variable])}`).join(', ')).join('; ');
  const formulaText = formatFormulaForSolution(formula);
  const targetClause = target ? 'la menh de dung' : 'la menh de sai';
  return {
    answer,
    solution: [
      'Cach quan sat: day la menh de chua bien nen chi can thay gia tri trong tung lua chon vao P roi xet dung/sai.',
      `Cong thuc can kiem tra: ${formulaText}.`,
      `Voi lua chon ${answer}, thay ${assignmentText} thi ${targetClause}, dung voi yeu cau de bai.`,
      `Vay chon ${answer}.`,
      'Bay can tranh: khong giai theo cam tinh; hay thay gia tri vao ca hai ve va so sanh dung dau =, >, <, >=, <=.',
    ].join(' '),
    kind,
    confidence: 0.9,
  };
}

function formatFormulaForSolution(formula: string): string {
  return normalizeMathChars(formula)
    .replace(/\s+/g, ' ')
    .replace(/([xyz])\s+([2-9])\b/g, '$1^$2')
    .replace(/([0-9])\s+([xyz])/g, '$1$2')
    .replace(/\s*(>=|<=|=|>|<)\s*/g, ' $1 ')
    .replace(/\s*([+\-*/])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMathChars(value: string): string {
  return normalizeInline(value)
    .replace(/âˆ’|−|–|—/g, '-')
    .replace(/â‰¥|≥/g, '>=')
    .replace(/â‰¤|≤/g, '<=')
    .replace(/â‰ |≠/g, '!=')
    .replace(/[“”]/g, '"')
    .replace(/,/g, '.');
}

function parseNumber(value: string): number {
  return Number(String(value || '').replace(',', '.'));
}

function formatNumber(value: unknown): string {
  return Number.isFinite(Number(value)) ? String(Number(value)) : '?';
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((value) => Number.isFinite(value)).map((value) => Number(value)))].sort((a, b) => a - b);
}

function sameNumberSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => Math.abs(value - b[index]) <= 1e-9);
}

function extractFirstQuotedText(value: string): string | undefined {
  const match = String(value || '').match(/["“]([\s\S]+?)["”]/);
  return match?.[1] ? normalizeInline(match[1]) : undefined;
}

function extractStatementAfterLastColon(value: string): string | undefined {
  const text = normalizeInline(value);
  const colonIndex = Math.max(text.lastIndexOf(':'), text.lastIndexOf('：'));
  if (colonIndex < 0) return undefined;
  const candidate = normalizeInline(text.slice(colonIndex + 1).replace(/[.。]+$/g, ''));
  if (!candidate || candidate.length > 160) return undefined;
  return /[<>=≤≥≠]|[∀∃⋮]/.test(candidate) ? candidate : undefined;
}

function normalizeLogicText(value: string): string {
  let text = normalizeMathChars(value)
    .replace(/[−–—]/g, '-')
    .replace(/[≤≦]/g, '<=')
    .replace(/[≥≧]/g, '>=')
    .replace(/[≠]/g, '!=')
    .replace(/[⇒]/g, '=>')
    .replace(/[⇔]/g, '<=>')
    .replace(/∄/g, '!∃')
    .replace(/\s+/g, ' ');
  text = normalizeSearchText(text);
  return text.replace(/\s+/g, ' ').trim();
}

function getNegatedRelationOperator(logic: string): string | undefined {
  const relation = logic.match(/(<=|>=|!=|=|>|<)/);
  return relation?.[1] ? negateRelationOperator(relation[1]) : undefined;
}

function negateRelationOperator(operator: string): string | undefined {
  const opposites: Record<string, string> = {
    '<=': '>',
    '>=': '<',
    '<': '>=',
    '>': '<=',
    '=': '!=',
    '!=': '=',
  };
  return opposites[operator];
}

function logicHasRelationOperator(logic: string, operator: string): boolean {
  if (operator === '<=') return logic.includes('<=');
  if (operator === '>=') return logic.includes('>=');
  if (operator === '!=') return logic.includes('!=');
  if (operator === '>') return /(^|[^<>=!])>(?!=)/.test(logic);
  if (operator === '<') return /(^|[^<>=!])<(?!=)/.test(logic);
  if (operator === '=') return /(^|[^<>=!])=(?!=)/.test(logic);
  return false;
}

function hasCompatibleDomain(sourceLogic: string, optionLogic: string): boolean {
  const domains = ['ℝ', 'ℕ', 'ℤ', 'ℚ'];
  const sourceDomains = domains.filter((domain) => sourceLogic.includes(domain));
  if (!sourceDomains.length) return true;
  return sourceDomains.every((domain) => optionLogic.includes(domain));
}

function solveSimpleSentenceNegation(
  quoted: string,
  options: Array<{ option: ChoiceOption; logic: string; search: string }>,
): Math10AutoSolution | undefined {
  const quotedSearch = normalizeSearchText(quoted);
  const matches = options.filter((entry) => {
    if (quotedSearch.includes('doi') && quotedSearch.includes('chim')) {
      return entry.search.includes('doi') && entry.search.includes('khong phai') && entry.search.includes('chim');
    }
    if (quotedSearch.includes('2 la so le')) {
      return entry.search.includes('2 la so chan');
    }
    if (quotedSearch.includes('la so nguyen to')) {
      return entry.search.includes('khong') && entry.search.includes('so nguyen to');
    }
    return false;
  });
  if (matches.length !== 1) return undefined;
  const answer = matches[0].option.key;
  return {
    answer,
    solution: [
      'Cach quan sat: phu dinh cua mot cau khang dinh la cau khang dinh dieu nguoc lai ve cung doi tuong.',
      `Lua chon ${answer} phu dinh dung noi dung cua menh de da cho, nen chon ${answer}.`,
      'Bay can tranh: phu dinh phai giu cung doi tuong, khong doi sang mot thong tin khac khong tuong duong.',
    ].join(' '),
    kind: 'logic_simple_sentence_negation_solver',
    confidence: 0.88,
  };
}

function extractIfThenParts(value: string): { premise: string; conclusion: string } | undefined {
  const search = normalizeSearchText(value)
    .replace(/[“”"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const match = search.match(/\bneu\s+(.+?)\s+thi\s+(.+)$/);
  if (!match?.[1] || !match[2]) return undefined;
  return {
    premise: normalizeInline(match[1]),
    conclusion: normalizeInline(match[2].replace(/[.?!]+$/g, '')),
  };
}

function contentTokens(value: string): string[] {
  const stop = new Set([
    'neu', 'thi', 'mot', 'la', 'co', 'cua', 'cac', 'va', 'do', 'duoc', 'bang', 'khong', 'phai',
    'hinh', 'tu', 'giac', 'tam', 'duong', 'hai', 'ba', 'no', 'nay', 'ay',
  ]);
  return uniqueStrings(normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !stop.has(token)));
}

function tokenOverlapRatio(candidate: string[], expected: string[]): number {
  if (!candidate.length || !expected.length) return 0;
  const candidateSet = new Set(candidate);
  const overlap = expected.filter((token) => candidateSet.has(token)).length;
  return overlap / expected.length;
}

type LogicMatcher = (logic: string, search: string) => boolean;

function getQuantifierTranslationSpecs(sentence: string): LogicMatcher[] {
  if (sentence.includes('voi moi so thuc') && sentence.includes('binh phuong') && sentence.includes('lon hon hoac bang 0')) {
    return [
      (logic) => logic.includes('∀'),
      (logic) => logic.includes('ℝ'),
      (logic) => logic.includes('x^2') && logic.includes('>=') && /\b0\b/.test(logic),
    ];
  }
  if (sentence.includes('co mot so nguyen') && sentence.includes('bang binh phuong cua chinh no')) {
    return [
      (logic) => logic.includes('∃'),
      (logic) => logic.includes('ℤ'),
      (logic) => logic.includes('x') && logic.includes('x^2') && logic.includes('='),
    ];
  }
  if (sentence.includes('co mot so huu ti') && sentence.includes('nho hon nghich dao')) {
    return [
      (logic) => logic.includes('∃'),
      (logic) => logic.includes('ℚ'),
      (logic) => logic.includes('<') && !logic.includes('>'),
    ];
  }
  if (sentence.includes('phep nhan') && sentence.includes('phan phoi') && sentence.includes('phep cong')) {
    return [
      (logic) => logic.includes('∀') && !logic.includes('∃'),
      (logic) => logic.includes('ℝ'),
      (logic) => ['x', 'y', 'z'].every((variable) => logic.includes(variable)),
      (logic) => logic.includes('y + z') && logic.includes('x. y') && logic.includes('x. z'),
    ];
  }
  if (sentence.includes('co it nhat mot so thuc') && sentence.includes('binh phuong') && sentence.includes('bang 3')) {
    return [
      (logic) => logic.includes('∃'),
      (logic) => logic.includes('ℝ'),
      (logic) => logic.includes('x^2') && logic.includes('=') && /\b3\b/.test(logic),
    ];
  }
  if (sentence.includes('hai so thuc') && sentence.includes('bat ki') && sentence.includes('ton tai') && sentence.includes('so huu ti') && sentence.includes('nam giua')) {
    return [
      (logic) => logic.includes('∀') && logic.includes('∃'),
      (logic) => logic.includes('ℝ') && logic.includes('ℚ'),
      (logic) => ['a', 'b', 'r'].every((variable) => logic.includes(variable)),
      (logic) => logic.includes('a < b') && logic.includes('a < r') && logic.includes('r < b'),
    ];
  }
  return [];
}

type SearchMatcher = (search: string) => boolean;

function getQuantifierMeaningOptionMatchers(quotedLogic: string): SearchMatcher[] {
  if (quotedLogic.includes('∀') && quotedLogic.includes('ℝ') && quotedLogic.includes('x^2') && quotedLogic.includes('- 4x') && quotedLogic.includes('= 0')) {
    return [
      (search) => search.includes('moi so thuc'),
      (search) => search.includes('nghiem') && search.includes('phuong trinh'),
    ];
  }
  if (quotedLogic.includes('∃') && quotedLogic.includes('ℝ') && quotedLogic.includes('x > x^2')) {
    return [
      (search) => search.includes('co mot so thuc'),
      (search) => search.includes('lon hon') && !search.includes('lon hon hoac bang'),
      (search) => search.includes('binh phuong cua no'),
    ];
  }
  if (quotedLogic.includes('∀') && quotedLogic.includes('ℕ') && quotedLogic.includes('ℚ')) {
    return [
      (search) => search.includes('moi so tu nhien'),
      (search) => search.includes('so huu ti'),
    ];
  }
  if (quotedLogic.includes('∀') && quotedLogic.includes('ℝ') && quotedLogic.includes('x < x + 1')) {
    return [
      (search) => search.includes('moi so thuc'),
      (search) => search.includes('nho hon') && search.includes('cong them 1'),
    ];
  }
  return [];
}

function classifyVectorEquality(optionText: string): boolean | undefined {
  const normalized = normalizeVectorText(optionText);
  if (!normalized.includes('=')) return undefined;
  if (/[1-9]/.test(normalized)) return undefined;
  if (/[<>≤≥]/.test(normalized)) return undefined;
  const parts = normalized.split('=');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined;
  const left = parseVectorExpression(parts[0]);
  const right = parseVectorExpression(parts[1]);
  if (!left || !right) return undefined;
  return sameVectorMap(left, right);
}

function normalizeVectorText(value: string): string {
  return normalizeInline(value)
    .replace(/[−–—]/g, '-')
    .replace(/[→⃗ρ]/g, '')
    .replace(/vec\s*\(\s*([A-Z]{2})\s*\)/gi, '$1')
    .replace(/\boverrightarrow\s*\{\s*([A-Z]{2})\s*\}/gi, '$1')
    .replace(/[.。]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseVectorExpression(expression: string): Record<string, number> | undefined {
  const text = normalizeVectorText(expression).replace(/\s+/g, '');
  if (!text) return undefined;
  if (text === '0') return {};
  const terms = text.match(/[+-]?(?:[A-Z]{2}|0)/g);
  if (!terms?.length) return undefined;
  const consumed = terms.join('');
  if (consumed !== text) return undefined;

  const coefficients: Record<string, number> = {};
  for (const rawTerm of terms) {
    const sign = rawTerm.startsWith('-') ? -1 : 1;
    const term = rawTerm.replace(/^[+-]/, '');
    if (term === '0') continue;
    if (!/^[A-Z]{2}$/.test(term)) return undefined;
    const start = term[0];
    const end = term[1];
    coefficients[start] = (coefficients[start] || 0) - sign;
    coefficients[end] = (coefficients[end] || 0) + sign;
  }
  return removeZeroVectorCoefficients(coefficients);
}

function removeZeroVectorCoefficients(value: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(value).filter(([, coefficient]) => coefficient !== 0));
}

function sameVectorMap(left: Record<string, number>, right: Record<string, number>): boolean {
  const keys = uniqueStrings([...Object.keys(left), ...Object.keys(right)]).sort();
  return keys.every((key) => (left[key] || 0) === (right[key] || 0));
}

function extractCoordinatePoints(value: string): CoordinatePoint[] {
  const text = normalizeMathChars(value);
  const points: CoordinatePoint[] = [];
  const pointMatches = [...text.matchAll(/([A-Z])?\s*\(\s*([+-]?\s*\d+(?:\.\d+)?)\s*;\s*([+-]?\s*\d+(?:\.\d+)?)\s*\)/g)];
  for (const match of pointMatches) {
    const x = parseNumber((match[2] || '').replace(/\s+/g, ''));
    const y = parseNumber((match[3] || '').replace(/\s+/g, ''));
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    points.push({ label: match[1], x, y });
  }
  return points;
}

function parseLinearEquation(value: string): LinearEquation | undefined {
  const normalized = normalizeMathChars(value).toLowerCase();
  const equalsIndex = normalized.lastIndexOf('=');
  if (equalsIndex < 0) return undefined;
  if (!/=\s*0\b/.test(normalized.slice(equalsIndex))) return undefined;
  let left = normalized.slice(0, equalsIndex);
  const colonIndex = Math.max(left.lastIndexOf(':'), left.lastIndexOf('：'));
  if (colonIndex >= 0) left = left.slice(colonIndex + 1);
  if (/[\/^{}()[\];]/.test(left)) return undefined;
  left = left
    .replace(/−|–|—/g, '-')
    .replace(/[^0-9xy+\-.]/g, '')
    .replace(/^\+/, '');
  if (!/[xy]/.test(left)) return undefined;
  const terms = left.match(/[+-]?[^+-]+/g);
  if (!terms?.length) return undefined;

  let a = 0;
  let b = 0;
  let c = 0;
  for (const term of terms) {
    if (!term) continue;
    if (term.includes('x')) {
      const coeff = parseLinearCoefficient(term, 'x');
      if (coeff === undefined) return undefined;
      a += coeff;
    } else if (term.includes('y')) {
      const coeff = parseLinearCoefficient(term, 'y');
      if (coeff === undefined) return undefined;
      b += coeff;
    } else {
      const constant = parseNumber(term);
      if (!Number.isFinite(constant)) return undefined;
      c += constant;
    }
  }
  if (Math.abs(a) <= 1e-12 && Math.abs(b) <= 1e-12) return undefined;
  return { a, b, c };
}

function parseLinearCoefficient(term: string, variable: 'x' | 'y'): number | undefined {
  let raw = term.replace(variable, '');
  if (raw === '' || raw === '+') return 1;
  if (raw === '-') return -1;
  raw = raw.replace(/\*$/, '');
  const value = parseNumber(raw);
  return Number.isFinite(value) ? value : undefined;
}

function extractLinearEquations(value: string): LinearEquation[] {
  const text = normalizeMathChars(value).replace(/\s+/g, ' ');
  const equations: LinearEquation[] = [];
  const matches = [...text.matchAll(/=\s*0\b/g)];
  for (const match of matches) {
    const end = (match.index || 0) + match[0].length;
    const before = text.slice(0, end);
    const starts = [
      before.lastIndexOf('.'),
      before.lastIndexOf('?'),
      before.lastIndexOf('\n'),
      before.lastIndexOf(' và '),
      before.lastIndexOf(' va '),
      before.lastIndexOf(';'),
    ];
    const start = Math.max(...starts, -1) + 1;
    const candidate = before.slice(start);
    const equation = parseLinearEquation(candidate);
    if (equation && !equations.some((existing) => sameLinearEquation(existing, equation))) equations.push(equation);
  }
  return equations;
}

function sameLinearEquation(first: LinearEquation, second: LinearEquation): boolean {
  return Math.abs(first.a - second.a) <= 1e-9
    && Math.abs(first.b - second.b) <= 1e-9
    && Math.abs(first.c - second.c) <= 1e-9;
}

function linesAreParallel(first: LinearEquation, second: LinearEquation): boolean {
  return Math.abs(first.a * second.b - second.a * first.b) <= 1e-9;
}

function lineIsParallelToFirstQuadrantBisector(equation: LinearEquation): boolean {
  return Math.abs(equation.a + equation.b) <= 1e-9;
}

function pointSatisfiesLine(point: CoordinatePoint | { x: number; y: number }, equation: LinearEquation): boolean {
  return Math.abs(equation.a * point.x + equation.b * point.y + equation.c) <= 1e-8;
}

function solveLineAxisIntersection(equation: LinearEquation | undefined, axis: 'x' | 'y'): CoordinatePoint | undefined {
  if (!equation) return undefined;
  if (axis === 'x') {
    if (Math.abs(equation.a) <= 1e-12) return undefined;
    return { x: -equation.c / equation.a, y: 0 };
  }
  if (Math.abs(equation.b) <= 1e-12) return undefined;
  return { x: 0, y: -equation.c / equation.b };
}

function solveLinearSystem(first: LinearEquation | undefined, second: LinearEquation | undefined): CoordinatePoint | undefined {
  if (!first || !second) return undefined;
  const determinant = first.a * second.b - second.a * first.b;
  if (Math.abs(determinant) <= 1e-12) return undefined;
  return {
    x: (first.b * second.c - second.b * first.c) / determinant,
    y: (second.a * first.c - first.a * second.c) / determinant,
  };
}

function selectMatchingPointOption(parsed: ChoiceParseResult, point: CoordinatePoint): string | undefined {
  const matches = parsed.options.filter((option) => {
    const optionPoint = extractCoordinatePoints(option.text)[0];
    return Boolean(optionPoint && Math.abs(optionPoint.x - point.x) <= 1e-8 && Math.abs(optionPoint.y - point.y) <= 1e-8);
  });
  return matches.length === 1 ? matches[0].key : undefined;
}

function selectMatchingPointSetOption(parsed: ChoiceParseResult, points: CoordinatePoint[]): string | undefined {
  const expected = uniqueCoordinatePoints(points);
  const matches = parsed.options.filter((option) => sameCoordinatePointSet(extractCoordinatePoints(option.text), expected));
  return matches.length === 1 ? matches[0].key : undefined;
}

function uniqueCoordinatePoints(points: Array<CoordinatePoint | { x: number; y: number }>): CoordinatePoint[] {
  const unique: CoordinatePoint[] = [];
  for (const point of points) {
    if (!unique.some((existing) => Math.abs(existing.x - point.x) <= 1e-8 && Math.abs(existing.y - point.y) <= 1e-8)) {
      unique.push({ x: point.x, y: point.y });
    }
  }
  return unique.sort((a, b) => Math.abs(a.x - b.x) > 1e-8 ? a.x - b.x : a.y - b.y);
}

function sameCoordinatePointSet(actual: CoordinatePoint[], expected: CoordinatePoint[]): boolean {
  const cleanActual = uniqueCoordinatePoints(actual);
  if (cleanActual.length !== expected.length) return false;
  return expected.every((point) => cleanActual.some((candidate) => Math.abs(candidate.x - point.x) <= 1e-8 && Math.abs(candidate.y - point.y) <= 1e-8));
}

function formatPointList(points: CoordinatePoint[]): string {
  return points.map((point) => `(${formatNumber(point.x)}; ${formatNumber(point.y)})`).join(', ');
}

function extractTargetDistanceSquared(value: string): number | undefined {
  const normalized = normalizeMathChars(value);
  const match = normalized.match(/\b(?:bang|b\S*ng)\s+([^.;\n]+)/i);
  return match?.[1] ? parseDistanceOptionSquared(match[1]) : undefined;
}

function parseDistanceOptionSquared(value: string): number | undefined {
  const normalized = normalizeMathChars(value)
    .replace(/[âˆš√]/g, ' sqrt ')
    .replace(/\s+/g, ' ')
    .trim();
  const target = normalizeInline(normalized.includes('=') ? normalized.slice(normalized.lastIndexOf('=') + 1) : normalized)
    .replace(/[.ã€‚]+$/g, '')
    .trim();
  if (!target || /[();]/.test(target)) return undefined;

  const sqrt = target.match(/(-?\d+(?:\.\d+)?)?\s*sqrt\s*(-?\d+(?:\.\d+)?)/i);
  if (sqrt?.[2]) {
    const coeff = sqrt[1] ? parseNumber(sqrt[1]) : 1;
    const radicand = parseNumber(sqrt[2]);
    return Number.isFinite(coeff) && Number.isFinite(radicand) && radicand >= 0 ? coeff * coeff * radicand : undefined;
  }

  const numbers = [...target.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => parseNumber(match[0]));
  if (numbers.some((entry) => !Number.isFinite(entry))) return undefined;
  if (numbers.length === 1) return numbers[0] * numbers[0];
  if (numbers.length === 2 && numbers[0] > 0 && numbers[1] > 0) return numbers[0] * numbers[0] * numbers[1];
  return undefined;
}

function isFirstDegreeTwoVariableInequality(value: string): boolean {
  const text = normalizeMathChars(value).toLowerCase();
  if (!/(>=|<=|>|<)/.test(text)) return false;
  if (!/x/.test(text) || !/y/.test(text)) return false;
  if (/[a-wz]/.test(text.replace(/[xy]/g, ''))) return false;
  if (/[{}()[\]]/.test(text)) return false;
  const compact = text.replace(/\s+/g, '');
  if (/\^[2-9]/.test(compact)) return false;
  if (/(?:x|y)\s*(?:x|y)/.test(compact)) return false;
  const allowed = compact.replace(/>=|<=|>|</g, '').replace(/[0-9xy+\-*.=]/g, '');
  return allowed.length === 0;
}

function extractLinearInequalityEvaluators(value: string): FormulaEvaluator[] {
  const normalized = normalizeMathChars(value)
    .replace(/−|–|—/g, '-')
    .replace(/\s+/g, ' ');
  const evaluators: FormulaEvaluator[] = [];
  const matches = [...normalized.matchAll(/([0-9xyXY+\-().\s]+)\s*(>=|<=|>|<)\s*([0-9xyXY+\-().\s]+)/g)];
  for (const match of matches) {
    const left = normalizeInline(match[1] || '');
    const operator = match[2] || '';
    const right = normalizeInline(match[3] || '');
    if (!left || !right || !/[xyXY]/.test(`${left} ${right}`)) continue;
    const evaluator = buildFormulaEvaluator(`${left} ${operator} ${right}`);
    if (evaluator && evaluator.variables.every((variable) => variable === 'x' || variable === 'y')) {
      evaluators.push(evaluator);
    }
  }
  return evaluators;
}

function hasTrailingInequalityInPointOption(value: string): boolean {
  const withoutFirstPoint = normalizeMathChars(value).replace(/([A-Z])?\s*\(\s*-?\d+(?:\.\d+)?\s*;\s*-?\d+(?:\.\d+)?\s*\)/, ' ');
  return /[xyXY][^A-D]{0,80}(?:>=|<=|>|<)|(?:>=|<=|>|<)[^A-D]{0,80}[xyXY]/.test(withoutFirstPoint);
}

function parseChoiceOptions(prompt: string): ChoiceParseResult | undefined {
  const markers = [...prompt.matchAll(/(^|[\s\n])([A-D])\.\s*/g)].map((match) => {
    const leading = match[1] || '';
    const markerStart = (match.index || 0) + leading.length;
    return {
      key: (match[2] || '').toUpperCase(),
      markerStart,
      contentStart: (match.index || 0) + match[0].length,
    };
  });

  for (let start = 0; start <= markers.length - OPTION_SEQUENCE.length; start += 1) {
    const sequence = markers.slice(start, start + OPTION_SEQUENCE.length);
    if (!sequence.every((marker, index) => marker.key === OPTION_SEQUENCE[index])) continue;

    const extra = markers[start + OPTION_SEQUENCE.length];
    const trailingText = extra ? normalizeInline(prompt.slice(extra.contentStart)) : '';
    const dOptionTextBeforeExtra = extra ? normalizeInline(prompt.slice(sequence[3].contentStart, extra.markerStart)) : '';
    const extraStartsOwnLine = extra ? /\n\s*$/.test(prompt.slice(0, extra.markerStart)) : false;
    const trailingAnswerKey = extra
      && trailingText.length === 0
      && extraStartsOwnLine
      && dOptionTextBeforeExtra.length >= 8
      && dOptionTextBeforeExtra.length <= 260
      && !hasSourceNoiseAfterChoices(dOptionTextBeforeExtra)
      && extra.markerStart - sequence[3].markerStart <= 320
      ? extra.key
      : undefined;
    const endForLastOption = trailingAnswerKey ? extra.markerStart : prompt.length;
    const options = sequence.map((marker, index): ChoiceOption => {
      const next = sequence[index + 1];
      const contentEnd = next ? next.markerStart : endForLastOption;
      return {
        key: marker.key,
        text: normalizeInline(prompt.slice(marker.contentStart, contentEnd)),
        markerStart: marker.markerStart,
        contentStart: marker.contentStart,
      };
    });

    if (options.some((option) => option.text.length < 1)) return undefined;
    return {
      options,
      optionStart: sequence[0].markerStart,
      trailingAnswerKey,
      promptWithoutTrailingAnswer: trailingAnswerKey ? normalizeInline(prompt.slice(0, extra.markerStart)) : undefined,
    };
  }

  return undefined;
}

function hasSourceNoiseAfterChoices(value: string): boolean {
  const search = normalizeSearchText(value);
  return /\b(?:page|trang|chuong|chuyen de|lien he|website|tai lieu|gmail|zalo)\b/.test(search)
    || /\{\{formula:/.test(value);
}

function hasUnsafeAutoPrompt(prompt: string, parsed: ChoiceParseResult): boolean {
  const search = normalizeSearchText(prompt);
  const afterChoicesSearch = normalizeSearchText(prompt.slice(parsed.optionStart));
  if (/\b(?:page|trang|lien he|website|gmail|zalo|dap an|huong dan cham)\b/.test(search)) return true;
  if (/\b(?:menh de chua bien|phuong phap giai|dang bai|chuong)\b/.test(afterChoicesSearch)) return true;
  if (parsed.options.some((option) => option.text.length > 320 || hasSourceNoiseAfterChoices(option.text))) return true;
  return false;
}

function mergeMath10Explanation(item: QuestionItem, auto: Math10AutoSolution): Record<string, unknown> {
  const base = item.explanation && typeof item.explanation === 'object' && !Array.isArray(item.explanation)
    ? item.explanation as Record<string, unknown>
    : {};
  const previousThinking = typeof base.thinking === 'string' ? base.thinking : '';
  return {
    ...base,
    sourceSolutionStatus: 'generated_miumath_solution',
    guidedSolutionStatus: 'generated_miumath_solution',
    thinking: previousThinking
      ? `${previousThinking}\n\n**4. Loi giai bo sung:** ${auto.solution}`
      : `**1. Quan sat & nhan dien:** ${auto.solution}`,
    steps: auto.solution,
    answer: auto.answer,
    generatedSolution: auto.solution,
    generatedSolutionKind: auto.kind,
    generatedSolutionConfidence: auto.confidence,
    teacherNote: 'Loi giai nay do rule-based MiuMath solver tao cho nhom de ro, khong phu thuoc hinh; van nen uu tien giao vien spot-check theo lo.',
  };
}

function inferMath10Misconceptions(item: QuestionItem): string[] {
  const topicId = String(item.metadata?.topicId || '');
  if (topicId.includes('logic_sets')) {
    return [
      'mis.math10.logic.confuses_false_statement_with_non_proposition',
      'mis.math10.logic.ignores_open_sentence_variable',
    ];
  }
  return [];
}

function hasRecoveredSourceSnippet(item: QuestionItem): boolean {
  const figureAsset = item.metadata?.figureAsset;
  return Boolean(
    figureAsset
    && typeof figureAsset === 'object'
    && !Array.isArray(figureAsset)
    && (figureAsset as Record<string, unknown>).displayMode === 'source_snippet_repair',
  );
}

function hasScorableAnswer(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasScorableAnswer);
  return String(value ?? '').trim().length > 0;
}

function normalizeInline(value: string): string {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function normalizeSearchText(value: string): string {
  let text = String(value || '').toLowerCase();
  for (const [from, to] of SEARCH_TEXT_REPAIRS) {
    text = text.replace(new RegExp(from, 'g'), to);
  }
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

const SEARCH_TEXT_REPAIRS: Array<[string, string]> = [
  ['cõu', 'cau'],
  ['cỏc', 'cac'],
  ['thỡ', 'thi'],
  ['tỡm', 'tim'],
  ['trờn', 'tren'],
  ['khụng', 'khong'],
  ['cú', 'co'],
  ['giỏc', 'giac'],
  ['trũn', 'tron'],
  ['gúc', 'goc'],
  ['hỡnh', 'hinh'],
  ['chộo', 'cheo'],
  ['phõn', 'phan'],
  ['nú', 'no'],
  ['cõu', 'cau'],
  ['cỏc', 'cac'],
  ['cú', 'co'],
  ['cỳ', 'co'],
  ['khụng', 'khong'],
  ['nhiờu', 'nhieu'],
  ['nào', 'nao'],
  ['nã o', 'nao'],
  ['hóy', 'hay'],
  ['đõy', 'day'],
  ['ụm', 'om'],
  ['hụm', 'hom'],
  ['lạnh', 'lanh'],
  ['thế', 'the'],
  ['nhỉ', 'nhi'],
  ['riờng', 'rieng'],
  ['đụng', 'dong'],
  ['dõn', 'dan'],
  ['vụ', 'vo'],
  ['tỉ', 'ti'],
  ['tá»‰', 'ti'],
  ['đỳng', 'dung'],
  ['sai', 'sai'],
];
