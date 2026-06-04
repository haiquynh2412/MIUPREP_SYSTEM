export type LessonTemplateStageId =
  | 'concept_summary'
  | 'worked_example'
  | 'guided_steps'
  | 'independent_set'
  | 'mixed_review'
  | 'reflection';

export interface LessonTemplateStage {
  id: LessonTemplateStageId;
  title: string;
  durationMinutes: number;
  teacherMove: string;
  studentAction: string;
}

export interface LessonPracticeItem {
  prompt: string;
  expectedMove: string;
}

export interface MathLessonTemplate {
  id: string;
  title: string;
  focus: string;
  gradeBand: string;
  conceptIds: string[];
  skillIds: string[];
  prerequisiteIds: string[];
  remediationObjectiveIds: string[];
  estimatedMinutes: number;
  masteryTarget: number;
  stages: LessonTemplateStage[];
  commonTraps: string[];
  guidedQuestions: LessonPracticeItem[];
  independentSet: LessonPracticeItem[];
  mixedReview: LessonPracticeItem[];
  quickCheck: LessonPracticeItem;
  reflectionPrompt: string;
}

export interface LessonTemplateRecommendation {
  template: MathLessonTemplate;
  matchScore: number;
  matchReason: string;
}

export type MathErrorChannel =
  | 'conceptual_reasoning'
  | 'procedure_gap'
  | 'calculation_slip'
  | 'casio_fast_operation'
  | 'reading_modeling'
  | 'geometry_proof';

export interface MathErrorSplit {
  channel: MathErrorChannel;
  label: string;
  repairMode: string;
  casioCheck: string;
  reasoningCheck: string;
}

export interface Math9BackfillUnit {
  id: string;
  title: string;
  cluster: string;
  conceptIds: string[];
  skillIds: string[];
  prerequisiteIds: string[];
  diagnosticTrigger: string;
  repairMove: string;
  checkpoint: string;
}

export type Math1012ExpansionStatus = 'planned' | 'ready_for_seed' | 'import_ready';

export interface Math1012ExpansionCluster {
  id: string;
  title: string;
  gradeBand: 'Grade 10' | 'Grade 11' | 'Grade 12';
  cluster: string;
  conceptIds: string[];
  skillIds: string[];
  prerequisiteIds: string[];
  objectiveIds: string[];
  entryGate: string;
  importGuard: string;
  lessonMove: string;
  diagnosticProbe: string;
  readinessSignal: string;
  status: Math1012ExpansionStatus;
}

export interface MathBackfillRecommendation {
  unit: Math9BackfillUnit;
  matchScore: number;
  matchReason: string;
}

export interface Math1012ClusterRecommendation {
  cluster: Math1012ExpansionCluster;
  matchScore: number;
  matchReason: string;
}

export interface GeometryProofScaffold {
  title: string;
  steps: LessonPracticeItem[];
  theoremBank: string[];
  finalProofRule: string;
}

export interface Math1012Readiness {
  status: 'backfill_first' | 'ready_for_grade10_cluster' | 'ready_for_import';
  focusCluster: string;
  guardrail: string;
}

export interface MathRemediationPlan {
  templates: LessonTemplateRecommendation[];
  backfillUnits: MathBackfillRecommendation[];
  math1012Clusters: Math1012ClusterRecommendation[];
  errorSplit: MathErrorSplit;
  proofScaffold?: GeometryProofScaffold;
  math1012Readiness: Math1012Readiness;
}

export type EnglishCoreArea =
  | 'vocabulary'
  | 'collocation'
  | 'grammar'
  | 'reading_inference'
  | 'listening_detail'
  | 'writing'
  | 'speaking';

export interface EnglishCoreLessonTemplate {
  id: string;
  title: string;
  focus: string;
  area: EnglishCoreArea;
  examLayers: string[];
  conceptIds: string[];
  skillIds: string[];
  prerequisiteIds: string[];
  remediationObjectiveIds: string[];
  estimatedMinutes: number;
  masteryTarget: number;
  stages: LessonTemplateStage[];
  commonTraps: string[];
  guidedQuestions: LessonPracticeItem[];
  independentSet: LessonPracticeItem[];
  transferTask: LessonPracticeItem;
  quickCheck: LessonPracticeItem;
  reflectionPrompt: string;
}

export interface EnglishCoreRecommendation {
  template: EnglishCoreLessonTemplate;
  matchScore: number;
  matchReason: string;
}

export interface EnglishCoreRemediationPlan {
  templates: EnglishCoreRecommendation[];
  errorLens: {
    area: EnglishCoreArea;
    label: string;
    repairMode: string;
    evidenceCheck: string;
  };
  microCycle: string[];
  transferTargets: string[];
}

export const ENGLISH_CORE_LESSON_TEMPLATES: EnglishCoreLessonTemplate[] = [
  {
    id: 'eng.core.vocab_collocation.precision',
    title: 'Vocabulary and Collocation Precision',
    focus: 'Move from word meaning to natural phrase choice and register.',
    area: 'collocation',
    examLayers: ['IELTS', 'CAE', 'CPE', 'SAT'],
    conceptIds: ['eng.vocabulary_range', 'eng.collocation_phraseology', 'eng.academic_register'],
    skillIds: ['eng.use_collocation', 'eng.build_word_family', 'eng.choose_register'],
    prerequisiteIds: ['eng.vocabulary_range'],
    remediationObjectiveIds: ['obj.english.vocabulary_core'],
    estimatedMinutes: 24,
    masteryTarget: 82,
    stages: createEnglishStages({
      summary: 'Anchor the target word in meaning, word family, collocation, and register.',
      worked: 'Upgrade five vague phrases into precise academic or exam-appropriate collocations.',
      guided: 'Learner explains why each collocation fits the surrounding noun/verb/register.',
      independent: 'Create a phrase bank with context sentence, not isolated translation.',
      mixed: 'Apply the same phrases in a reading sentence, writing sentence, and speaking answer.',
      reflection: 'Name the collocation that is reusable and the context where it is unsafe.',
    }),
    commonTraps: [
      'Learner translates a Vietnamese phrase literally into English.',
      'Learner chooses a rare word but pairs it with an unnatural noun or verb.',
      'Learner uses formal academic wording in a casual speaking turn.',
    ],
    guidedQuestions: [
      { prompt: 'What noun or verb does this phrase naturally attach to?', expectedMove: 'Check the phrase as a chunk, not as separate words.' },
      { prompt: 'Is the phrase neutral, academic, informal, or idiomatic?', expectedMove: 'Name the register before using it.' },
    ],
    independentSet: [
      { prompt: 'Replace five vague phrases with natural collocations.', expectedMove: 'Keep the meaning stable while improving precision.' },
      { prompt: 'Build three word-family rows from one root word.', expectedMove: 'Use noun, verb, adjective, and one safe collocation.' },
    ],
    transferTask: { prompt: 'Use two upgraded collocations in a short IELTS/CAE/CPE paragraph.', expectedMove: 'The phrases sound natural and support the argument.' },
    quickCheck: { prompt: 'Why is a correct dictionary word still sometimes wrong?', expectedMove: 'Because collocation and register can make it unnatural in context.' },
    reflectionPrompt: 'Which phrase will you reuse this week, and in which exact context?',
  },
  {
    id: 'eng.core.grammar.clause_control',
    title: 'Grammar Clause Control',
    focus: 'Control sentence role, tense, agreement, and clause connection before answer selection.',
    area: 'grammar',
    examLayers: ['IELTS', 'CAE', 'CPE', 'SAT'],
    conceptIds: ['eng.grammar_accuracy', 'eng.sentence_structure', 'eng.verb_tense_aspect', 'eng.cohesion_reference'],
    skillIds: ['eng.control_clause_structure', 'eng.control_tense_aspect', 'eng.edit_sentence_errors', 'eng.track_cohesive_reference'],
    prerequisiteIds: ['eng.sentence_structure'],
    remediationObjectiveIds: ['obj.english.grammar_core'],
    estimatedMinutes: 26,
    masteryTarget: 84,
    stages: createEnglishStages({
      summary: 'Label sentence job first: subject, verb, object, modifier, connector, reference.',
      worked: 'Repair one sentence by marking clause boundaries before changing grammar.',
      guided: 'Learner predicts the grammar role before choosing form, tense, or punctuation.',
      independent: 'Edit six sentences and write the reason for each correction.',
      mixed: 'Mix SAT boundaries, CPE transformations, and IELTS writing sentence control.',
      reflection: 'Record the grammar role that caused the highest-risk mistake.',
    }),
    commonTraps: [
      'Learner trusts what sounds right without checking sentence role.',
      'Learner fixes tense but leaves reference or connector ambiguity.',
      'Learner changes a phrase without checking subject-verb agreement.',
    ],
    guidedQuestions: [
      { prompt: 'What is the grammatical job of the underlined phrase?', expectedMove: 'Label the role before selecting the answer.' },
      { prompt: 'Which word controls tense or agreement here?', expectedMove: 'Find the anchor subject, time marker, or surrounding verb pattern.' },
    ],
    independentSet: [
      { prompt: 'Edit three clause-boundary errors.', expectedMove: 'Mark independent/dependent clauses before punctuation.' },
      { prompt: 'Rewrite three tense/aspect errors.', expectedMove: 'Use time marker and verb relationship to justify the change.' },
    ],
    transferTask: { prompt: 'Apply two controlled structures in a fresh writing or speaking response.', expectedMove: 'Structures are accurate and do not reduce clarity.' },
    quickCheck: { prompt: 'What must you identify before correcting grammar?', expectedMove: 'The role of the phrase in the sentence.' },
    reflectionPrompt: 'Which grammar role will you check first in the next practice set?',
  },
  {
    id: 'eng.core.reading.inference_bridge',
    title: 'Reading Inference Bridge',
    focus: 'Turn textual evidence into a controlled inference without over-reading.',
    area: 'reading_inference',
    examLayers: ['IELTS', 'CAE', 'CPE', 'SAT'],
    conceptIds: ['eng.reading_detail', 'eng.reading_inference', 'eng.reading_argument_structure', 'eng.vocabulary_range'],
    skillIds: ['eng.identify_specific_detail', 'eng.infer_implicit_meaning', 'eng.evaluate_argument_flow', 'eng.use_collocation'],
    prerequisiteIds: ['eng.reading_detail'],
    remediationObjectiveIds: ['obj.english.reading_core', 'obj.ielts.reading_listening_beta'],
    estimatedMinutes: 25,
    masteryTarget: 82,
    stages: createEnglishStages({
      summary: 'Separate stated detail, implied meaning, author attitude, and distractor stretch.',
      worked: 'Mark evidence line, paraphrase it, then choose the answer with the least extra assumption.',
      guided: 'Learner explains why two wrong answers go beyond the text.',
      independent: 'Do five inference items with evidence line and paraphrase note.',
      mixed: 'Mix IELTS True/False/Not Given, SAT inference, and CAE/CPE gapped-text logic.',
      reflection: 'Write the difference between inference and personal guess.',
    }),
    commonTraps: [
      'Learner chooses an answer that is true in real life but not proven by the text.',
      'Learner matches one keyword and ignores the sentence logic.',
      'Learner overstates cautious language from the passage.',
    ],
    guidedQuestions: [
      { prompt: 'Which exact line supports the answer?', expectedMove: 'Point to evidence before reading the options again.' },
      { prompt: 'What extra assumption would make this option unsafe?', expectedMove: 'Name the unsupported leap.' },
    ],
    independentSet: [
      { prompt: 'Solve three inference questions with evidence notes.', expectedMove: 'Evidence line and paraphrase must both be present.' },
      { prompt: 'Reject two distractors by naming the overreach.', expectedMove: 'Explain the stretch, opposite meaning, or unsupported detail.' },
    ],
    transferTask: { prompt: 'Use the same evidence-paraphrase-answer routine on a SAT or IELTS passage.', expectedMove: 'Answer is tied to evidence, not keyword matching.' },
    quickCheck: { prompt: 'What makes an inference answer safe?', expectedMove: 'It is implied by evidence with no extra assumption.' },
    reflectionPrompt: 'What kind of distractor caught you today: overreach, opposite, or keyword trap?',
  },
  {
    id: 'eng.core.listening.detail_map',
    title: 'Listening Detail Map',
    focus: 'Capture specific detail, paraphrase, correction, and speaker attitude under time pressure.',
    area: 'listening_detail',
    examLayers: ['IELTS', 'CAE', 'CPE'],
    conceptIds: ['eng.listening_main_idea', 'eng.listening_detail', 'eng.listening_inference', 'eng.listening_attitude', 'eng.vocabulary_range'],
    skillIds: ['eng.identify_listening_main_idea', 'eng.identify_specific_detail', 'eng.infer_speaker_attitude', 'eng.use_collocation'],
    prerequisiteIds: ['eng.listening_detail'],
    remediationObjectiveIds: ['obj.english.listening_core', 'obj.ielts.reading_listening_beta'],
    estimatedMinutes: 22,
    masteryTarget: 80,
    stages: createEnglishStages({
      summary: 'Listen for paraphrase, correction markers, speaker attitude, and final answer position.',
      worked: 'Replay a short audio segment and map distractor -> correction -> final detail.',
      guided: 'Learner predicts answer type before listening and confirms after correction marker.',
      independent: 'Do four short listening items with keyword/paraphrase table.',
      mixed: 'Mix form completion, multiple choice, and speaker attitude questions.',
      reflection: 'Name the marker that changed the answer.',
    }),
    commonTraps: [
      'Learner writes the first number/name heard instead of the corrected one.',
      'Learner misses paraphrase because only one keyword was expected.',
      'Learner confuses speaker attitude with topic detail.',
    ],
    guidedQuestions: [
      { prompt: 'What answer type are you listening for?', expectedMove: 'Predict number, noun, place, reason, or attitude.' },
      { prompt: 'Did the speaker correct or qualify the first detail?', expectedMove: 'Wait for final detail after but/however/actually.' },
    ],
    independentSet: [
      { prompt: 'Complete four listening details with correction markers.', expectedMove: 'Write the final detail, not the first distractor.' },
      { prompt: 'Match three paraphrases from audio to answer options.', expectedMove: 'Connect meaning, not exact words.' },
    ],
    transferTask: { prompt: 'Apply the detail map to one IELTS Listening section.', expectedMove: 'Answer type, paraphrase, and final detail are recorded.' },
    quickCheck: { prompt: 'Why is the first heard answer often dangerous?', expectedMove: 'It may be a distractor before correction or qualification.' },
    reflectionPrompt: 'Which marker will you listen for next time before writing the answer?',
  },
  {
    id: 'eng.core.writing.argument_cycle',
    title: 'Writing Argument Cycle',
    focus: 'Plan, develop, and revise a paragraph with task response, coherence, vocabulary, and grammar control.',
    area: 'writing',
    examLayers: ['IELTS', 'CAE', 'CPE', 'SAT'],
    conceptIds: ['eng.academic_writing', 'eng.writing_task_response', 'eng.paragraph_development', 'eng.essay_coherence', 'eng.grammar_accuracy', 'eng.vocabulary_range'],
    skillIds: ['eng.plan_essay_response', 'eng.develop_body_paragraph', 'eng.revise_for_coherence', 'eng.develop_academic_argument', 'eng.control_clause_structure', 'eng.use_collocation'],
    prerequisiteIds: ['eng.grammar_accuracy', 'eng.vocabulary_range'],
    remediationObjectiveIds: ['obj.english.writing_core', 'obj.english.grammar_core', 'obj.english.vocabulary_core'],
    estimatedMinutes: 30,
    masteryTarget: 82,
    stages: createEnglishStages({
      summary: 'Build one paragraph from claim, evidence, explanation, language upgrade, and final revision.',
      worked: 'Convert a weak paragraph into a focused argument with one clear development line.',
      guided: 'Learner checks whether each sentence has a job before adding advanced language.',
      independent: 'Write one paragraph, then revise for coherence, grammar, and collocation.',
      mixed: 'Use the same paragraph loop for IELTS Task 2, CAE/CPE essay, or SAT expression of ideas.',
      reflection: 'Record the single revision that improved clarity the most.',
    }),
    commonTraps: [
      'Learner writes many ideas but does not develop one deeply.',
      'Learner upgrades vocabulary before fixing sentence logic.',
      'Learner uses linking words without real argument progression.',
    ],
    guidedQuestions: [
      { prompt: 'What is the job of this sentence in the paragraph?', expectedMove: 'Label claim, support, explanation, contrast, or conclusion.' },
      { prompt: 'Which sentence should be developed instead of adding a new idea?', expectedMove: 'Pick the strongest claim and expand it.' },
    ],
    independentSet: [
      { prompt: 'Write one body paragraph from a clear claim.', expectedMove: 'Claim, evidence, explanation, and final link are visible.' },
      { prompt: 'Revise the paragraph for two language upgrades only.', expectedMove: 'Upgrade collocation and grammar without changing meaning.' },
    ],
    transferTask: { prompt: 'Submit the revised paragraph to AI Tutor feedback-to-practice.', expectedMove: 'Feedback creates one specific next drill.' },
    quickCheck: { prompt: 'What makes a paragraph deep instead of long?', expectedMove: 'One idea is explained with evidence and consequence.' },
    reflectionPrompt: 'Which sentence carried the paragraph, and which sentence was unnecessary?',
  },
  {
    id: 'eng.core.speaking.response_loop',
    title: 'Speaking Response Loop',
    focus: 'Organize, sustain, and repair spoken answers with fluency, pronunciation, interaction, and language control.',
    area: 'speaking',
    examLayers: ['IELTS', 'CAE', 'CPE'],
    conceptIds: ['eng.speaking_fluency', 'eng.pronunciation_control', 'eng.interactive_communication', 'eng.spoken_discourse_management', 'eng.vocabulary_range', 'eng.grammar_accuracy'],
    skillIds: ['eng.organize_spoken_response', 'eng.sustain_fluent_turn', 'eng.manage_interactive_communication', 'eng.use_pronunciation_features', 'eng.use_collocation', 'eng.control_clause_structure'],
    prerequisiteIds: ['eng.vocabulary_range', 'eng.grammar_accuracy'],
    remediationObjectiveIds: ['obj.english.speaking_core', 'obj.english.vocabulary_core', 'obj.english.grammar_core'],
    estimatedMinutes: 28,
    masteryTarget: 80,
    stages: createEnglishStages({
      summary: 'Use answer frame, support detail, repair phrase, pronunciation focus, and short reflection.',
      worked: 'Transform a fragmented answer into a clear spoken response with one expansion route.',
      guided: 'Learner practices a 45-second answer with a planned opening and repair phrase.',
      independent: 'Record two answers: one controlled, one natural, then compare clarity.',
      mixed: 'Apply the loop to IELTS Part 2, CAE/CPE collaborative task, and follow-up questions.',
      reflection: 'Name the repair phrase and pronunciation feature to keep.',
    }),
    commonTraps: [
      'Learner answers in fragments and loses the main point.',
      'Learner speaks faster instead of organizing the response.',
      'Learner freezes after correction instead of using a repair phrase.',
    ],
    guidedQuestions: [
      { prompt: 'What is your first sentence frame?', expectedMove: 'Start with a direct answer before adding detail.' },
      { prompt: 'What phrase will you use if you need to self-correct?', expectedMove: 'Use a repair phrase instead of stopping completely.' },
    ],
    independentSet: [
      { prompt: 'Record a 45-second response with one expansion route.', expectedMove: 'Opening, detail, example, and short closing are audible.' },
      { prompt: 'Repeat the answer with one pronunciation target.', expectedMove: 'Improve stress, linking, or final sounds without over-speeding.' },
    ],
    transferTask: { prompt: 'Submit the answer to AI speaking feedback-to-practice.', expectedMove: 'Feedback produces one fluency or pronunciation drill.' },
    quickCheck: { prompt: 'What should you do when you make a speaking error?', expectedMove: 'Repair and continue; do not restart the whole answer.' },
    reflectionPrompt: 'Which phrase helped you keep speaking when the answer became difficult?',
  },
];

export const MATH9_REPAIR_LESSON_TEMPLATES: MathLessonTemplate[] = [
  {
    id: 'math9.algebra_transform.repair',
    title: 'Algebra Transform Repair',
    focus: 'Bien doi dai so dung tung buoc',
    gradeBand: 'Math 8-9',
    conceptIds: ['math.algebraic_expression', 'math.factorization'],
    skillIds: ['math.simplify_expression', 'math.factor_common_terms'],
    prerequisiteIds: ['math.linear_expression', 'math.polynomial', 'math.fraction_decimal', 'math.integer_number'],
    remediationObjectiveIds: ['obj.math.grade6_8.algebra_foundation', 'obj.math.grade9.quadratic_foundation'],
    estimatedMinutes: 24,
    masteryTarget: 80,
    stages: createStandardStages({
      summary: 'Nhan dien phep bien doi hop le: quy dong, rut gon, phan tich nhan tu, dat dieu kien.',
      worked: 'Bien doi mot bieu thuc chua can theo 4 cot: dieu kien, mau chung, rut gon, doi chieu ket qua.',
      guided: 'Hoc sinh dien thieu buoc bien doi va noi ly do vi sao buoc do hop le.',
      independent: 'Lam 5 cau bien doi dai so khong xem loi giai, moi cau ghi mot dieu kien can giu.',
      mixed: 'Tron bieu thuc chua can, phan thuc dai so va he so am de kiem tra do ben.',
      reflection: 'Viet lai dau hieu nhan biet khi nao can dat dieu kien truoc.',
    }),
    commonTraps: [
      'Rut gon nhan tu chung khi mau so co the bang 0.',
      'Quy dong xong bo quen doi dau ca tu thuc.',
      'Xoa can hoac binh phuong hai ve khi chua dat dieu kien.',
    ],
    guidedQuestions: [
      { prompt: 'Truoc khi rut gon phan thuc chua can, can ghi dieu kien nao?', expectedMove: 'Dat dieu kien mau khac 0 va bieu thuc trong can khong am.' },
      { prompt: 'Neu mau la (sqrt(x)-2)(sqrt(x)-3), buoc rut gon nao phai kiem tra lai?', expectedMove: 'Kiem tra nhan tu bi triet tieu khong lam mat dieu kien.' },
    ],
    independentSet: [
      { prompt: 'Rut gon mot phan thuc co mau gom hai nhan tu bac nhat theo sqrt(x).', expectedMove: 'Quy dong, phan tich, rut gon kem dieu kien.' },
      { prompt: 'So sanh hai cach bien doi va tim buoc sai.', expectedMove: 'Chi ra phep chia cho bieu thuc co the bang 0.' },
    ],
    mixedReview: [
      { prompt: 'Giai nhanh mot cau rut gon va mot cau tim x sau rut gon.', expectedMove: 'Dung ket qua rut gon de giai, quay lai doi chieu dieu kien.' },
    ],
    quickCheck: { prompt: 'Mot bieu thuc bi rut gon mat nghiem khi nao?', expectedMove: 'Khi chia/triet tieu nhan tu co the bang 0 ma khong giu dieu kien loai.' },
    reflectionPrompt: 'Lan sau gap bieu thuc dai, em se viet dong kiem tra nao dau tien?',
  },
  {
    id: 'math9.factorization.bridge',
    title: 'Factorization Bridge',
    focus: 'Phan tich nhan tu de mo khoa phuong trinh bac hai',
    gradeBand: 'Math 8-9',
    conceptIds: ['math.factorization', 'math.polynomial'],
    skillIds: ['math.factor_common_terms', 'math.factor_polynomial', 'math.solve_quadratic_by_factor'],
    prerequisiteIds: ['math.linear_expression', 'math.polynomial'],
    remediationObjectiveIds: ['obj.math.grade6_8.algebra_foundation', 'obj.math.grade9.quadratic_foundation'],
    estimatedMinutes: 22,
    masteryTarget: 82,
    stages: createStandardStages({
      summary: 'Chon dung cong cu: nhan tu chung, hang dang thuc, nhom hang tu, tam thuc bac hai.',
      worked: 'Phan tich da thuc theo cay quyet dinh: co nhan tu chung khong, co dang hang dang thuc khong, co the nhom khong.',
      guided: 'Hoc sinh chon phuong phap truoc khi tinh, tranh thu lam bang tay qua som.',
      independent: 'Lam 6 cau phan tich nhan tu tang dan, moi cau phai ghi ten phuong phap.',
      mixed: 'Tron cau factorization voi cau giai phuong trinh de thay ung dung that.',
      reflection: 'Chot mot dau hieu nhan biet tung dang factorization.',
    }),
    commonTraps: [
      'Thay hang dang thuc ao khi dau tru/hang tu khong khop.',
      'Quen dat nhan tu chung am de bieu thuc con lai dep hon.',
      'Phan tich xong khong nhan nguoc de kiem tra.',
    ],
    guidedQuestions: [
      { prompt: 'Khi nao nen dat nhan tu chung truoc?', expectedMove: 'Khi moi hang tu co thua so chung ve so, bien, hoac bieu thuc.' },
      { prompt: 'Sau khi phan tich, cach check nhanh nhat la gi?', expectedMove: 'Nhan nguoc hai nhan tu de khop da thuc ban dau.' },
    ],
    independentSet: [
      { prompt: 'Phan tich da thuc co nhan tu chung am.', expectedMove: 'Dat nhan tu chung am de con lai co he so dau duong.' },
      { prompt: 'Phan tich tam thuc bac hai co nghiem nguyen.', expectedMove: 'Tim hai so co tong va tich phu hop.' },
    ],
    mixedReview: [
      { prompt: 'Dung factorization de giai mot phuong trinh tich bang 0.', expectedMove: 'Tach thanh cac nhan tu va giai tung nhan tu bang 0.' },
    ],
    quickCheck: { prompt: 'Tai sao can nhan nguoc sau khi phan tich nhan tu?', expectedMove: 'De phat hien sai dau, thieu hang tu, hoac dat nhan tu chung sai.' },
    reflectionPrompt: 'Dang factorization nao em hay nham nhat, va dau hieu nao se giup em dung lai?',
  },
  {
    id: 'math9.quadratic_equation.repair',
    title: 'Quadratic Equation Repair',
    focus: 'Giai phuong trinh bac hai va dung Vieta co dieu kien',
    gradeBand: 'Math 9',
    conceptIds: ['math.quadratic_equation', 'math.vieta', 'math.factorization'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.apply_vieta', 'math.analyze_function_graph'],
    prerequisiteIds: ['math.factorization', 'math.linear_equation'],
    remediationObjectiveIds: ['obj.math.grade9.quadratic_foundation'],
    estimatedMinutes: 28,
    masteryTarget: 82,
    stages: createStandardStages({
      summary: 'Chon chien luoc giai: phan tich nhan tu, delta, Vieta, hoac do thi tuy cau hoi.',
      worked: 'Giai mot phuong trinh bac hai co tham so bang bang quyet dinh: dang nao, dieu kien nao, ket luan nao.',
      guided: 'Hoc sinh dien dieu kien delta/nghiem truoc khi su dung Vieta.',
      independent: 'Lam 5 cau: 2 cau factor, 2 cau delta, 1 cau Vieta co dieu kien.',
      mixed: 'Tron phuong trinh, ham so y=ax^2 va bai toan tham so m.',
      reflection: 'Chot khi nao Vieta nhanh hon delta va khi nao khong duoc dung.',
    }),
    commonTraps: [
      'Dung Vieta khi phuong trinh chua chac co hai nghiem.',
      'Tinh delta dung nhung ket luan sai so nghiem.',
      'Quen dieu kien a khac 0 trong phuong trinh bac hai co tham so.',
    ],
    guidedQuestions: [
      { prompt: 'Truoc khi ap dung Vieta voi tham so m, can kiem tra gi?', expectedMove: 'Kiem tra a khac 0 va dieu kien co nghiem neu bai yeu cau nghiem thuc.' },
      { prompt: 'Neu delta = 0 thi ket luan nao dung?', expectedMove: 'Phuong trinh co nghiem kep x = -b/(2a).' },
    ],
    independentSet: [
      { prompt: 'Giai phuong trinh bac hai co the phan tich thanh tich.', expectedMove: 'Phan tich nhan tu roi cho tung nhan tu bang 0.' },
      { prompt: 'Tim m de phuong trinh co hai nghiem phan biet.', expectedMove: 'Dat a khac 0 va delta > 0.' },
    ],
    mixedReview: [
      { prompt: 'Lien he nghiem phuong trinh voi giao diem parabol va duong thang.', expectedMove: 'Dua ve phuong trinh hoanh do giao diem va xet so nghiem.' },
    ],
    quickCheck: { prompt: 'Mot cau Vieta co tham so can hai dieu kien nao truoc khi bien doi?', expectedMove: 'a khac 0 va dieu kien ton tai nghiem phu hop voi yeu cau.' },
    reflectionPrompt: 'Khi thay phuong trinh bac hai, em se dung cau hoi nao de chon phuong phap giai?',
  },
  {
    id: 'math9.geometry_proof.scaffold',
    title: 'Geometry Proof Scaffold',
    focus: 'Chung minh hinh hoc theo khung given -> prove -> theorem -> plan',
    gradeBand: 'Math 8-10',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof', 'math.trigonometry'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning', 'math.use_trig_ratios'],
    prerequisiteIds: ['math.basic_geometry', 'math.plane_geometry'],
    remediationObjectiveIds: ['obj.math.grade6_8.geometry_foundation', 'obj.math.grade9.miumath_pilot'],
    estimatedMinutes: 30,
    masteryTarget: 78,
    stages: createStandardStages({
      summary: 'Moi bai chung minh bat dau bang 4 dong: given, need prove, known theorem, proof plan.',
      worked: 'Chung minh quan he duong tron bang cach danh dau goc, cung, tiep tuyen, tu giac noi tiep.',
      guided: 'Hoc sinh chon dinh ly phu hop truoc khi viet loi giai day du.',
      independent: 'Lam 3 chung minh ngan: goc bang nhau, tu giac noi tiep, thang hang/dong quy.',
      mixed: 'Tron hinh hoc voi luong giac tam giac vuong de tranh hoc may moc.',
      reflection: 'Chot mot so do hinh va mot dinh ly da dung.',
    }),
    commonTraps: [
      'Viet luon loi giai khi chua xac dinh can chung minh gi.',
      'Dung dinh ly dao khi chua du dieu kien.',
      'Bo qua quan he trung diem, vuong goc, song song da cho trong de.',
    ],
    guidedQuestions: [
      { prompt: 'Dong dau tien cua bai chung minh nen viet gi?', expectedMove: 'Tach given va need prove thanh hai dong rieng.' },
      { prompt: 'Khi nao nghi den tu giac noi tiep?', expectedMove: 'Khi co hai goc cung chan mot cung, tong hai goc doi 180 do, hoac cung nhin mot doan.' },
    ],
    independentSet: [
      { prompt: 'Chung minh hai goc bang nhau trong cau hinh duong tron.', expectedMove: 'Tim cung hoac day chung de dung goc noi tiep.' },
      { prompt: 'Chung minh bon diem cung thuoc mot duong tron.', expectedMove: 'Chung minh tong hai goc doi 180 do hoac hai goc cung nhin mot doan.' },
    ],
    mixedReview: [
      { prompt: 'Them mot tam giac vuong va tinh ti so luong giac sau khi chung minh goc.', expectedMove: 'Dung ket qua goc de xac dinh tam giac vuong/phu hop ti so.' },
    ],
    quickCheck: { prompt: 'Neu chua biet dung dinh ly nao, em nen viet 4 dong nao?', expectedMove: 'Given, need prove, known theorem candidates, proof plan.' },
    reflectionPrompt: 'Dinh ly nao hom nay em dung duoc, va dau hieu nao goi nho dinh ly do?',
  },
];

export const MATH9_PREREQUISITE_BACKFILL_UNITS: Math9BackfillUnit[] = [
  {
    id: 'math9.unit01.sqrt_domain',
    title: 'Square-root domain and conditions',
    cluster: 'Radicals and expressions',
    conceptIds: ['math.algebraic_expression'],
    skillIds: ['math.simplify_expression'],
    prerequisiteIds: ['math.integer_number', 'math.fraction_decimal', 'math.linear_expression'],
    diagnosticTrigger: 'Drops x >= 0 or denominator conditions before simplifying radicals.',
    repairMove: 'Write condition line first, then transform each denominator into factors.',
    checkpoint: 'Student can name every excluded value before cancellation.',
  },
  {
    id: 'math9.unit02.radical_simplify',
    title: 'Radical simplification and conjugates',
    cluster: 'Radicals and expressions',
    conceptIds: ['math.algebraic_expression', 'math.factorization'],
    skillIds: ['math.simplify_expression', 'math.factor_common_terms'],
    prerequisiteIds: ['math.polynomial', 'math.linear_expression'],
    diagnosticTrigger: 'Simplifies a radical fraction but loses sign or conjugate structure.',
    repairMove: 'Use a two-column worked example: factor tree on the left, legal move on the right.',
    checkpoint: 'Student can explain why the conjugate is used before calculating.',
  },
  {
    id: 'math9.unit03.radical_equation',
    title: 'Radical equations and extraneous roots',
    cluster: 'Radicals and expressions',
    conceptIds: ['math.algebraic_expression', 'math.linear_equation'],
    skillIds: ['math.simplify_expression', 'math.solve_linear_equation'],
    prerequisiteIds: ['math.linear_expression', 'math.fraction_decimal'],
    diagnosticTrigger: 'Squares both sides without checking the original equation.',
    repairMove: 'Require solve -> substitute back -> reject/accept table.',
    checkpoint: 'Student checks each candidate root in the original problem.',
  },
  {
    id: 'math9.unit04.system_setup',
    title: 'Linear-system setup from text',
    cluster: 'Systems and modeling',
    conceptIds: ['math.linear_equation', 'math.word_problem_modeling'],
    skillIds: ['math.solve_system', 'math.model_word_problem'],
    prerequisiteIds: ['math.ratio_proportion', 'math.linear_expression'],
    diagnosticTrigger: 'Chooses variables after writing equations, or swaps quantities.',
    repairMove: 'Given -> variable definition -> equation meaning -> solve.',
    checkpoint: 'Student can state what each variable measures and its unit.',
  },
  {
    id: 'math9.unit05.system_elimination',
    title: 'Solving systems by elimination/substitution',
    cluster: 'Systems and modeling',
    conceptIds: ['math.linear_equation'],
    skillIds: ['math.solve_system'],
    prerequisiteIds: ['math.linear_expression', 'math.fraction_decimal'],
    diagnosticTrigger: 'Makes sign errors while eliminating or substituting.',
    repairMove: 'Color-code the equation being multiplied and the sign of the elimination step.',
    checkpoint: 'Student verifies the ordered pair in both original equations.',
  },
  {
    id: 'math9.unit06.system_word_problem',
    title: 'Word problems with systems',
    cluster: 'Systems and modeling',
    conceptIds: ['math.word_problem_modeling', 'math.linear_equation'],
    skillIds: ['math.model_word_problem', 'math.solve_system'],
    prerequisiteIds: ['math.ratio_proportion', 'math.linear_expression'],
    diagnosticTrigger: 'Solves correctly but answers the wrong real-world quantity.',
    repairMove: 'End every solution with a sentence tied to the variable definition.',
    checkpoint: 'Student labels the final answer with the requested quantity.',
  },
  {
    id: 'math9.unit07.linear_function_meaning',
    title: 'First-degree function meaning',
    cluster: 'Functions and graphs',
    conceptIds: ['math.functions_graphs', 'math.linear_equation'],
    skillIds: ['math.analyze_function_graph', 'math.solve_linear_equation'],
    prerequisiteIds: ['math.linear_expression'],
    diagnosticTrigger: 'Reads slope/intercept as isolated numbers without context.',
    repairMove: 'Use value table -> graph -> meaning of a and b.',
    checkpoint: 'Student describes slope and intercept in a full sentence.',
  },
  {
    id: 'math9.unit08.line_graph',
    title: 'Drawing and reading line graphs',
    cluster: 'Functions and graphs',
    conceptIds: ['math.functions_graphs'],
    skillIds: ['math.analyze_function_graph'],
    prerequisiteIds: ['math.linear_equation', 'math.basic_geometry'],
    diagnosticTrigger: 'Draws a line from one point or misreads axes.',
    repairMove: 'Force two-point table and axis-scale check before drawing.',
    checkpoint: 'Student can recover the function from two points.',
  },
  {
    id: 'math9.unit09.line_intersection',
    title: 'Line intersections and systems',
    cluster: 'Functions and graphs',
    conceptIds: ['math.functions_graphs', 'math.linear_equation'],
    skillIds: ['math.analyze_function_graph', 'math.solve_system'],
    prerequisiteIds: ['math.solve_linear_equation', 'math.basic_geometry'],
    diagnosticTrigger: 'Does not connect intersection with system solution.',
    repairMove: 'Solve algebraically, then mark the same point on the graph.',
    checkpoint: 'Student explains intersection as the pair satisfying both equations.',
  },
  {
    id: 'math9.unit10.quadratic_function',
    title: 'Quadratic function y = ax^2',
    cluster: 'Quadratic core',
    conceptIds: ['math.quadratic_equation', 'math.functions_graphs'],
    skillIds: ['math.analyze_function_graph'],
    prerequisiteIds: ['math.linear_equation', 'math.basic_geometry'],
    diagnosticTrigger: 'Confuses opening direction, symmetry, or point on parabola.',
    repairMove: 'Use sign of a, symmetry axis, and table of symmetric x-values.',
    checkpoint: 'Student predicts graph shape before plotting.',
  },
  {
    id: 'math9.unit11.quadratic_factor',
    title: 'Quadratic equations by factoring',
    cluster: 'Quadratic core',
    conceptIds: ['math.quadratic_equation', 'math.factorization'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.factor_common_terms'],
    prerequisiteIds: ['math.polynomial', 'math.linear_equation'],
    diagnosticTrigger: 'Expands when factoring would expose zero-product form.',
    repairMove: 'Decision tree: common factor -> identity -> grouping -> product zero.',
    checkpoint: 'Student can name the factoring method before solving.',
  },
  {
    id: 'math9.unit12.quadratic_delta',
    title: 'Quadratic formula and discriminant',
    cluster: 'Quadratic core',
    conceptIds: ['math.quadratic_equation'],
    skillIds: ['math.solve_quadratic_by_factor'],
    prerequisiteIds: ['math.integer_number', 'math.fraction_decimal', 'math.linear_equation'],
    diagnosticTrigger: 'Computes delta but gives wrong root count or root formula.',
    repairMove: 'Separate delta table from root formula; no mental jump.',
    checkpoint: 'Student links delta sign to number of real roots.',
  },
  {
    id: 'math9.unit13.vieta',
    title: 'Vieta theorem with existence conditions',
    cluster: 'Quadratic core',
    conceptIds: ['math.vieta', 'math.quadratic_equation'],
    skillIds: ['math.apply_vieta'],
    prerequisiteIds: ['math.factorization', 'math.linear_equation'],
    diagnosticTrigger: 'Uses Vieta before proving the equation has suitable roots.',
    repairMove: 'Require a != 0 and root-existence condition before sum/product.',
    checkpoint: 'Student writes both conditions before using Vieta.',
  },
  {
    id: 'math9.unit14.parameter_quadratic',
    title: 'Quadratic parameter problems',
    cluster: 'Quadratic core',
    conceptIds: ['math.quadratic_equation', 'math.functions_graphs'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.analyze_function_graph'],
    prerequisiteIds: ['math.vieta', 'math.linear_equation'],
    diagnosticTrigger: 'Forgets special cases such as a = 0 or delta boundary.',
    repairMove: 'Case split first, then solve the main quadratic condition.',
    checkpoint: 'Student checks boundary cases before final interval/answer.',
  },
  {
    id: 'math9.unit15.quadratic_word_problem',
    title: 'Quadratic word problems',
    cluster: 'Quadratic core',
    conceptIds: ['math.word_problem_modeling', 'math.quadratic_equation'],
    skillIds: ['math.model_word_problem', 'math.solve_quadratic_by_factor'],
    prerequisiteIds: ['math.linear_equation', 'math.ratio_proportion'],
    diagnosticTrigger: 'Builds the equation but does not reject impossible values.',
    repairMove: 'Model -> solve -> check reality constraint -> answer sentence.',
    checkpoint: 'Student rejects roots that do not fit the story.',
  },
  {
    id: 'math9.unit16_inequality_condition',
    title: 'Inequality and condition management',
    cluster: 'Algebra synthesis',
    conceptIds: ['math.inequality', 'math.algebraic_expression'],
    skillIds: ['math.solve_inequality', 'math.simplify_expression'],
    prerequisiteIds: ['math.linear_expression', 'math.integer_number'],
    diagnosticTrigger: 'Flips inequality sign incorrectly or ignores domain.',
    repairMove: 'Mark every negative multiplication/division and domain restriction.',
    checkpoint: 'Student can justify every interval endpoint.',
  },
  {
    id: 'math9.unit17.circle_angles',
    title: 'Circle angles and arcs',
    cluster: 'Geometry proof',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteIds: ['math.basic_geometry', 'math.plane_geometry'],
    diagnosticTrigger: 'Uses an angle theorem without naming the arc or chord.',
    repairMove: 'Draw arc/chord labels before writing theorem.',
    checkpoint: 'Student can connect equal angles to equal arcs/chords.',
  },
  {
    id: 'math9.unit18_cyclic_quad',
    title: 'Cyclic quadrilateral proof',
    cluster: 'Geometry proof',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteIds: ['math.basic_geometry', 'math.plane_geometry'],
    diagnosticTrigger: 'Claims four points are cyclic without a valid criterion.',
    repairMove: 'Choose one criterion: opposite angles, same segment, or right angle.',
    checkpoint: 'Student states the exact cyclic criterion used.',
  },
  {
    id: 'math9.unit19_tangent_chord',
    title: 'Tangent, chord, and radius relations',
    cluster: 'Geometry proof',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteIds: ['math.basic_geometry', 'math.plane_geometry'],
    diagnosticTrigger: 'Misses tangent-radius perpendicular relation.',
    repairMove: 'List tangent facts immediately after given.',
    checkpoint: 'Student marks every right angle created by a tangent.',
  },
  {
    id: 'math9.unit20_secant_tangent',
    title: 'Secant and tangent power relations',
    cluster: 'Geometry proof',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    prerequisiteIds: ['math.ratio_proportion', 'math.basic_geometry'],
    diagnosticTrigger: 'Applies length relation to the wrong segments.',
    repairMove: 'Name the whole segment and outside segment before multiplying.',
    checkpoint: 'Student can map each factor in the power relation to the diagram.',
  },
  {
    id: 'math9.unit21_proof_planning',
    title: 'Geometry proof planning',
    cluster: 'Geometry proof',
    conceptIds: ['math.geometry_proof', 'math.plane_geometry'],
    skillIds: ['math.geometry_reasoning', 'math.prove_circle_geometry'],
    prerequisiteIds: ['math.basic_geometry', 'math.plane_geometry'],
    diagnosticTrigger: 'Writes final proof before identifying the target and theorem path.',
    repairMove: 'Use fixed frame: given -> need prove -> theorem candidates -> proof plan -> final proof.',
    checkpoint: 'Student submits a proof plan before full proof.',
  },
  {
    id: 'math9.unit22_right_triangle_trig',
    title: 'Right-triangle trigonometry',
    cluster: 'Trigonometry',
    conceptIds: ['math.trigonometry', 'math.basic_geometry'],
    skillIds: ['math.use_trig_ratios', 'math.reason_basic_geometry'],
    prerequisiteIds: ['math.ratio_proportion', 'math.basic_geometry'],
    diagnosticTrigger: 'Swaps opposite/adjacent/hypotenuse sides.',
    repairMove: 'Label angle first, then write SOH-CAH-TOA relation.',
    checkpoint: 'Student identifies side names from the chosen angle.',
  },
  {
    id: 'math9.unit23_trig_application',
    title: 'Trigonometry applications',
    cluster: 'Trigonometry',
    conceptIds: ['math.trigonometry', 'math.word_problem_modeling'],
    skillIds: ['math.use_trig_ratios', 'math.model_word_problem'],
    prerequisiteIds: ['math.ratio_proportion', 'math.basic_geometry'],
    diagnosticTrigger: 'Sets up a trig ratio without drawing the right triangle.',
    repairMove: 'Sketch, label knowns/unknowns, then choose the ratio.',
    checkpoint: 'Student can explain why the selected ratio matches the diagram.',
  },
  {
    id: 'math9.unit24_similarity_in_proof',
    title: 'Similarity inside geometry proof',
    cluster: 'Geometry proof',
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.geometry_reasoning', 'math.prove_circle_geometry'],
    prerequisiteIds: ['math.ratio_proportion', 'math.basic_geometry'],
    diagnosticTrigger: 'Uses proportional lengths without proving similar triangles.',
    repairMove: 'Prove angle-angle similarity before any ratio step.',
    checkpoint: 'Student names the two equal angle pairs.',
  },
  {
    id: 'math9.unit25_solid_geometry',
    title: 'Cylinder, cone, sphere measures',
    cluster: 'Solid geometry',
    conceptIds: ['math.spatial_geometry'],
    skillIds: ['math.compute_solid_measure'],
    prerequisiteIds: ['math.basic_geometry', 'math.fraction_decimal'],
    diagnosticTrigger: 'Mixes surface area and volume formulas.',
    repairMove: 'Formula selection table: shape, requested quantity, known dimensions.',
    checkpoint: 'Student writes units squared/cubed correctly.',
  },
  {
    id: 'math9.unit26_statistics',
    title: 'Statistics and frequency tables',
    cluster: 'Statistics and probability',
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_statistics'],
    prerequisiteIds: ['math.fraction_decimal', 'math.ratio_proportion'],
    diagnosticTrigger: 'Reads a table correctly but uses the wrong denominator.',
    repairMove: 'Circle the sample total before computing mean/frequency/percentage.',
    checkpoint: 'Student can state what the denominator represents.',
  },
  {
    id: 'math9.unit27_probability',
    title: 'Basic probability',
    cluster: 'Statistics and probability',
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_probability'],
    prerequisiteIds: ['math.ratio_proportion', 'math.fraction_decimal'],
    diagnosticTrigger: 'Counts favorable outcomes but misses the total sample space.',
    repairMove: 'List sample space first, then favorable cases.',
    checkpoint: 'Student explains numerator and denominator in words.',
  },
  {
    id: 'math9.unit28_exam_synthesis',
    title: 'Mixed exam synthesis',
    cluster: 'Mixed exam readiness',
    conceptIds: ['math.quadratic_equation', 'math.functions_graphs', 'math.geometry_proof', 'math.statistics'],
    skillIds: ['math.solve_quadratic_by_factor', 'math.analyze_function_graph', 'math.geometry_reasoning', 'math.interpret_statistics'],
    prerequisiteIds: ['math.factorization', 'math.linear_equation', 'math.plane_geometry', 'math.fraction_decimal'],
    diagnosticTrigger: 'Can solve isolated units but fails when topic order is mixed.',
    repairMove: 'Start with classify-topic step, then solve only after choosing the route.',
    checkpoint: 'Student classifies topic and first move within 30 seconds.',
  },
];

export const MATH1012_EXPANSION_CLUSTERS: Math1012ExpansionCluster[] = [
  {
    id: 'math1012.g10.function_transform',
    title: 'Grade 10 function transformation',
    gradeBand: 'Grade 10',
    cluster: 'Functions and graphs',
    conceptIds: ['math.functions_graphs', 'math.advanced_function', 'math.quadratic_equation'],
    skillIds: ['math.analyze_function_graph', 'math.analyze_advanced_function', 'math.solve_quadratic_by_factor'],
    prerequisiteIds: ['math.factorization', 'math.linear_equation', 'math.functions_graphs'],
    objectiveIds: ['obj.math.grade10.function_vector_foundation'],
    entryGate: 'Student handles Math 9 linear/quadratic graph meaning and does not confuse equation roots with graph features.',
    importGuard: 'Each item must tag function family, transformation type, graph/equation skill, answer validation, and distractor trap.',
    lessonMove: 'Use table -> graph -> parameter meaning -> algebra check before shortcuts.',
    diagnosticProbe: 'Given y = ax^2 + bx + c, explain how parameter changes affect vertex, intercepts, and root count.',
    readinessSignal: '>=80% on quadratic/function graph prerequisites or no repeated Math 9 function-parameter misconception.',
    status: 'ready_for_seed',
  },
  {
    id: 'math1012.g10.vector_coordinate',
    title: 'Grade 10 vector and coordinate geometry',
    gradeBand: 'Grade 10',
    cluster: 'Vectors and coordinates',
    conceptIds: ['math.vector_coordinate_geometry', 'math.trigonometry', 'math.plane_geometry'],
    skillIds: ['math.solve_vector_coordinate_problem', 'math.use_trig_ratios', 'math.geometry_reasoning'],
    prerequisiteIds: ['math.trigonometry', 'math.plane_geometry', 'math.basic_geometry'],
    objectiveIds: ['obj.math.grade10.function_vector_foundation'],
    entryGate: 'Student can label angles/lengths and use coordinate distance or trig ratios without swapping quantities.',
    importGuard: 'Require diagram metadata, coordinate target, vector operation, and exact final-answer format.',
    lessonMove: 'Translate diagram into coordinates/vectors, solve, then verify with geometric meaning.',
    diagnosticProbe: 'Find a vector relation or coordinate length and state what each component represents.',
    readinessSignal: 'Geometry proof scaffold is stable and trigonometry checkpoint is passed.',
    status: 'ready_for_seed',
  },
  {
    id: 'math1012.g10.probability_intro',
    title: 'Grade 10 probability and counting bridge',
    gradeBand: 'Grade 10',
    cluster: 'Probability bridge',
    conceptIds: ['math.combinatorics_probability', 'math.probability', 'math.statistics'],
    skillIds: ['math.count_combinatoric_cases', 'math.compute_probability', 'math.interpret_statistics'],
    prerequisiteIds: ['math.probability', 'math.statistics', 'math.ratio_proportion'],
    objectiveIds: ['obj.math.grade12.geometry_probability_foundation'],
    entryGate: 'Student explains numerator, denominator, and sample space before applying formulas.',
    importGuard: 'Every item must state whether order/repetition matters and include sample-space validation.',
    lessonMove: 'Classify case type first, list a small sample space, then generalize to formula.',
    diagnosticProbe: 'Decide whether a counting situation is permutation, combination, product rule, or simple probability.',
    readinessSignal: 'No repeated total-sample-space errors in Math 9 probability backfill.',
    status: 'planned',
  },
  {
    id: 'math1012.g11.sequence_series',
    title: 'Grade 11 sequence and series',
    gradeBand: 'Grade 11',
    cluster: 'Sequences and series',
    conceptIds: ['math.sequence_series', 'math.advanced_function'],
    skillIds: ['math.work_with_sequence_series', 'math.analyze_advanced_function'],
    prerequisiteIds: ['math.functions_graphs', 'math.linear_equation'],
    objectiveIds: ['obj.math.grade11.algebra_calculus_foundation'],
    entryGate: 'Student recognizes function-like rules and can move between term number, value, and recurrence.',
    importGuard: 'Tag arithmetic/geometric/recurrence form, requested term/sum, and boundary condition.',
    lessonMove: 'Map term index -> formula -> pattern reason -> check first terms.',
    diagnosticProbe: 'Given first terms, identify rule type and compute a target term with justification.',
    readinessSignal: 'Function transformation cluster has stable mastery or no rule-index confusion.',
    status: 'ready_for_seed',
  },
  {
    id: 'math1012.g11.exponential_logarithm',
    title: 'Grade 11 exponential and logarithm domain',
    gradeBand: 'Grade 11',
    cluster: 'Exponential and logarithm',
    conceptIds: ['math.exponential_logarithm', 'math.advanced_function'],
    skillIds: ['math.solve_exponential_logarithm', 'math.analyze_advanced_function'],
    prerequisiteIds: ['math.advanced_function', 'math.functions_graphs', 'math.algebraic_expression'],
    objectiveIds: ['obj.math.grade11.algebra_calculus_foundation'],
    entryGate: 'Student writes domain/validity conditions before transforming expressions.',
    importGuard: 'Each item must include domain constraints, transformation law, and extraneous-root check when needed.',
    lessonMove: 'Condition line first, then convert forms, solve, and substitute back.',
    diagnosticProbe: 'Solve a logarithmic equation and reject invalid candidates with explicit domain reason.',
    readinessSignal: 'No repeated missing-domain-condition misconception in recent algebra/function attempts.',
    status: 'ready_for_seed',
  },
  {
    id: 'math1012.g11.calculus_derivative',
    title: 'Grade 11 derivative foundation',
    gradeBand: 'Grade 11',
    cluster: 'Calculus foundation',
    conceptIds: ['math.calculus_foundation', 'math.advanced_function'],
    skillIds: ['math.differentiate_basic_function', 'math.analyze_advanced_function'],
    prerequisiteIds: ['math.advanced_function', 'math.sequence_series', 'math.functions_graphs'],
    objectiveIds: ['obj.math.grade11.algebra_calculus_foundation'],
    entryGate: 'Student interprets function behavior before using derivative rules.',
    importGuard: 'Tag derivative rule, function family, monotonicity/extremum target, and graph interpretation.',
    lessonMove: 'Meaning of derivative -> rule application -> sign table -> graph conclusion.',
    diagnosticProbe: 'Differentiate a basic function and use sign information to identify increasing/decreasing intervals.',
    readinessSignal: 'Exponential/logarithm and advanced-function clusters have enough correct reasoning evidence.',
    status: 'planned',
  },
  {
    id: 'math1012.g12.solid_coordinate_geometry',
    title: 'Grade 12 solid and coordinate geometry',
    gradeBand: 'Grade 12',
    cluster: 'Advanced geometry',
    conceptIds: ['math.solid_geometry_advanced', 'math.spatial_geometry', 'math.vector_coordinate_geometry'],
    skillIds: ['math.reason_advanced_solid_geometry', 'math.solve_vector_coordinate_problem', 'math.compute_solid_measure'],
    prerequisiteIds: ['math.spatial_geometry', 'math.vector_coordinate_geometry', 'math.geometry_proof'],
    objectiveIds: ['obj.math.grade12.geometry_probability_foundation'],
    entryGate: 'Student can convert a diagram into known dimensions, coordinate facts, and target relation.',
    importGuard: 'Require diagram dependency, spatial relation, coordinate/vector bridge, and unit/answer check.',
    lessonMove: 'Draw auxiliary structure, choose coordinate/vector model, solve, then verify geometry meaning.',
    diagnosticProbe: 'Identify a distance/angle relation in space and choose the correct coordinate or geometric route.',
    readinessSignal: 'Grade 10 vector cluster and Math 9 solid-geometry formula checks are stable.',
    status: 'planned',
  },
  {
    id: 'math1012.g12.combinatorics_probability',
    title: 'Grade 12 combinatorics and probability',
    gradeBand: 'Grade 12',
    cluster: 'Combinatorics and probability',
    conceptIds: ['math.combinatorics_probability', 'math.probability', 'math.statistics_advanced'],
    skillIds: ['math.count_combinatoric_cases', 'math.compute_probability', 'math.analyze_advanced_statistics'],
    prerequisiteIds: ['math.probability', 'math.statistics'],
    objectiveIds: ['obj.math.grade12.geometry_probability_foundation'],
    entryGate: 'Student classifies order/repetition/condition before calculating.',
    importGuard: 'Every item must include case-type tag, denominator model, and overcount trap metadata.',
    lessonMove: 'Case classification -> formula or listing -> overcount check -> probability interpretation.',
    diagnosticProbe: 'Compare two solution routes and identify the overcount or undercount.',
    readinessSignal: 'Probability bridge passes and no repeated combinatorics-overcount signal.',
    status: 'ready_for_seed',
  },
  {
    id: 'math1012.g12.exam_synthesis',
    title: 'Grade 12 mixed exam synthesis',
    gradeBand: 'Grade 12',
    cluster: 'Upper-secondary exam synthesis',
    conceptIds: ['math.advanced_function', 'math.exponential_logarithm', 'math.calculus_foundation', 'math.solid_geometry_advanced', 'math.combinatorics_probability'],
    skillIds: ['math.analyze_advanced_function', 'math.solve_exponential_logarithm', 'math.differentiate_basic_function', 'math.reason_advanced_solid_geometry', 'math.count_combinatoric_cases'],
    prerequisiteIds: ['math.quadratic_equation', 'math.functions_graphs', 'math.trigonometry', 'math.probability'],
    objectiveIds: [
      'obj.math.grade10.function_vector_foundation',
      'obj.math.grade11.algebra_calculus_foundation',
      'obj.math.grade12.geometry_probability_foundation',
    ],
    entryGate: 'Student can classify topic and first move within 30 seconds on mixed Grade 10-12 prompts.',
    importGuard: 'Mixed sets must preserve concept/skill balance and avoid counting review-only items as new mastery evidence.',
    lessonMove: 'Classify topic -> choose route -> solve -> post-check answer constraints.',
    diagnosticProbe: 'Do a 6-item mixed set and explain the first move for each item before solving.',
    readinessSignal: 'At least one Grade 10, one Grade 11, and one Grade 12 cluster are import-ready.',
    status: 'planned',
  },
];

export function buildMathRemediationPlan(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  retryAttempts?: number;
  templateLimit?: number;
  backfillLimit?: number;
} = {}): MathRemediationPlan {
  const templates = recommendMath9LessonTemplates({
    weakConceptIds: input.weakConceptIds,
    weakSkillIds: input.weakSkillIds,
    weakLabel: input.weakLabel,
    limit: input.templateLimit || 4,
  });
  const backfillUnits = recommendMath9BackfillUnits({
    weakConceptIds: input.weakConceptIds,
    weakSkillIds: input.weakSkillIds,
    weakLabel: input.weakLabel,
    errorText: input.errorText,
    limit: input.backfillLimit || 5,
  });
  const math1012Clusters = recommendMath1012ExpansionClusters({
    weakConceptIds: input.weakConceptIds,
    weakSkillIds: input.weakSkillIds,
    weakLabel: input.weakLabel,
    errorText: input.errorText,
    limit: 4,
  });
  const errorSplit = classifyMathErrorSplit({
    ...input,
    templateId: templates[0]?.template.id,
    unitId: backfillUnits[0]?.unit.id,
  });

  return {
    templates,
    backfillUnits,
    math1012Clusters,
    errorSplit,
    proofScaffold: errorSplit.channel === 'geometry_proof' ? buildGeometryProofScaffold(input.weakLabel) : undefined,
    math1012Readiness: buildMath1012Readiness(backfillUnits, input),
  };
}

export function buildEnglishCoreRemediationPlan(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  limit?: number;
} = {}): EnglishCoreRemediationPlan {
  const templates = recommendEnglishCoreLessonTemplates(input);
  const errorLens = classifyEnglishErrorLens(input);
  const selected = templates[0]?.template;

  return {
    templates,
    errorLens,
    microCycle: buildEnglishMicroCycle(errorLens.area, selected),
    transferTargets: selected?.examLayers.length
      ? selected.examLayers.map((layer) => `${layer}: ${selected.area}`)
      : ['IELTS: core skill', 'CAE/CPE: core skill', 'SAT: transfer skill'],
  };
}

export function recommendEnglishCoreLessonTemplates(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  limit?: number;
} = {}): EnglishCoreRecommendation[] {
  const weakConceptIds = new Set(input.weakConceptIds || []);
  const weakSkillIds = new Set(input.weakSkillIds || []);
  const text = normalizeText([input.weakLabel, input.errorText, ...(input.weakConceptIds || []), ...(input.weakSkillIds || [])].join(' '));
  const lens = classifyEnglishErrorLens(input);
  const limit = Math.max(1, input.limit || 4);

  return ENGLISH_CORE_LESSON_TEMPLATES.map((template) => {
    const conceptMatch = countMatches(template.conceptIds, weakConceptIds);
    const skillMatch = countMatches(template.skillIds, weakSkillIds);
    const prerequisiteMatch = countMatches(template.prerequisiteIds, weakConceptIds);
    const textCorpus = normalizeText([
      template.id,
      template.title,
      template.focus,
      template.area,
      ...template.examLayers,
      ...template.conceptIds,
      ...template.skillIds,
      ...template.commonTraps,
    ].join(' '));
    const textMatch = countKeywordMatches(text, textCorpus);
    const lensMatch = template.area === lens.area || (lens.area === 'vocabulary' && template.area === 'collocation') ? 2 : 0;
    const matchScore = conceptMatch * 5 + skillMatch * 7 + prerequisiteMatch * 3 + textMatch + lensMatch * 4;

    return {
      template,
      matchScore,
      matchReason: buildEnglishMatchReason({ skillMatch, conceptMatch, prerequisiteMatch, textMatch, lensMatch, lensLabel: lens.label }),
    };
  })
    .sort((left, right) => right.matchScore - left.matchScore || left.template.estimatedMinutes - right.template.estimatedMinutes || left.template.id.localeCompare(right.template.id))
    .slice(0, limit);
}

export function recommendMath9BackfillUnits(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  limit?: number;
} = {}): MathBackfillRecommendation[] {
  const weakConceptIds = new Set(input.weakConceptIds || []);
  const weakSkillIds = new Set(input.weakSkillIds || []);
  const text = normalizeText(`${input.weakLabel || ''} ${input.errorText || ''}`);
  const limit = Math.max(1, input.limit || 5);

  return MATH9_PREREQUISITE_BACKFILL_UNITS.map((unit) => {
    const conceptMatch = countMatches(unit.conceptIds, weakConceptIds);
    const skillMatch = countMatches(unit.skillIds, weakSkillIds);
    const prerequisiteMatch = countMatches(unit.prerequisiteIds, weakConceptIds);
    const textCorpus = normalizeText([unit.id, unit.title, unit.cluster, unit.diagnosticTrigger, ...unit.conceptIds, ...unit.skillIds].join(' '));
    const textMatch = text && textCorpus.includes(text) ? 2 : countKeywordMatches(text, textCorpus);
    const matchScore = conceptMatch * 6 + skillMatch * 7 + prerequisiteMatch * 4 + textMatch;

    return {
      unit,
      matchScore,
      matchReason: buildBackfillReason({ conceptMatch, skillMatch, prerequisiteMatch, textMatch }),
    };
  })
    .sort((left, right) => right.matchScore - left.matchScore || left.unit.id.localeCompare(right.unit.id))
    .slice(0, limit);
}

export function recommendMath1012ExpansionClusters(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  limit?: number;
} = {}): Math1012ClusterRecommendation[] {
  const weakConceptIds = new Set(input.weakConceptIds || []);
  const weakSkillIds = new Set(input.weakSkillIds || []);
  const text = normalizeText([input.weakLabel, input.errorText, ...(input.weakConceptIds || []), ...(input.weakSkillIds || [])].join(' '));
  const limit = Math.max(1, input.limit || 4);

  return MATH1012_EXPANSION_CLUSTERS.map((cluster) => {
    const conceptMatch = countMatches(cluster.conceptIds, weakConceptIds);
    const skillMatch = countMatches(cluster.skillIds, weakSkillIds);
    const prerequisiteMatch = countMatches(cluster.prerequisiteIds, weakConceptIds);
    const textCorpus = normalizeText([
      cluster.id,
      cluster.title,
      cluster.gradeBand,
      cluster.cluster,
      cluster.entryGate,
      cluster.importGuard,
      cluster.lessonMove,
      cluster.diagnosticProbe,
      ...cluster.conceptIds,
      ...cluster.skillIds,
    ].join(' '));
    const textMatch = countKeywordMatches(text, textCorpus);
    const statusWeight = cluster.status === 'import_ready' ? 2 : cluster.status === 'ready_for_seed' ? 1 : 0;
    const matchScore = conceptMatch * 6 + skillMatch * 8 + prerequisiteMatch * 3 + textMatch + statusWeight;

    return {
      cluster,
      matchScore,
      matchReason: buildMath1012ClusterReason({ conceptMatch, skillMatch, prerequisiteMatch, textMatch, status: cluster.status }),
    };
  })
    .sort((left, right) => right.matchScore - left.matchScore || left.cluster.gradeBand.localeCompare(right.cluster.gradeBand) || left.cluster.id.localeCompare(right.cluster.id))
    .slice(0, limit);
}

export function recommendMath9LessonTemplates(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  limit?: number;
} = {}): LessonTemplateRecommendation[] {
  const weakConceptIds = new Set(input.weakConceptIds || []);
  const weakSkillIds = new Set(input.weakSkillIds || []);
  const weakLabel = normalizeText(input.weakLabel || '');
  const limit = Math.max(1, input.limit || 4);

  return MATH9_REPAIR_LESSON_TEMPLATES.map((template) => {
    const conceptMatch = countMatches(template.conceptIds, weakConceptIds);
    const skillMatch = countMatches(template.skillIds, weakSkillIds);
    const textMatch = weakLabel && normalizeText([template.title, template.focus, ...template.conceptIds, ...template.skillIds].join(' ')).includes(weakLabel)
      ? 2
      : 0;
    const prerequisiteMatch = countMatches(template.prerequisiteIds, weakConceptIds);
    const matchScore = conceptMatch * 5 + skillMatch * 7 + prerequisiteMatch * 3 + textMatch;
    return {
      template,
      matchScore,
      matchReason: buildMatchReason({ conceptMatch, skillMatch, prerequisiteMatch, textMatch, weakLabel }),
    };
  })
    .sort((left, right) => right.matchScore - left.matchScore || left.template.estimatedMinutes - right.template.estimatedMinutes)
    .slice(0, limit);
}

function createStandardStages(copy: {
  summary: string;
  worked: string;
  guided: string;
  independent: string;
  mixed: string;
  reflection: string;
}): LessonTemplateStage[] {
  return [
    { id: 'concept_summary', title: 'Concept summary', durationMinutes: 3, teacherMove: copy.summary, studentAction: 'Noi lai bang mot cau ngan.' },
    { id: 'worked_example', title: 'Worked example', durationMinutes: 6, teacherMove: copy.worked, studentAction: 'Che tung buoc va du doan buoc tiep theo.' },
    { id: 'guided_steps', title: 'Guided questions', durationMinutes: 6, teacherMove: copy.guided, studentAction: 'Tra loi cau hoi dan duong truoc khi tinh.' },
    { id: 'independent_set', title: 'Independent set', durationMinutes: 8, teacherMove: copy.independent, studentAction: 'Lam rieng, danh dau buoc con lung tung.' },
    { id: 'mixed_review', title: 'Mixed review', durationMinutes: 5, teacherMove: copy.mixed, studentAction: 'Nhan dien dang bai truoc khi giai.' },
    { id: 'reflection', title: 'Reflection', durationMinutes: 2, teacherMove: copy.reflection, studentAction: 'Viet mot dong bai hoc can nho.' },
  ];
}

function createEnglishStages(copy: {
  summary: string;
  worked: string;
  guided: string;
  independent: string;
  mixed: string;
  reflection: string;
}): LessonTemplateStage[] {
  return [
    { id: 'concept_summary', title: 'Core idea', durationMinutes: 3, teacherMove: copy.summary, studentAction: 'Restate the rule or routine in one sentence.' },
    { id: 'worked_example', title: 'Worked example', durationMinutes: 6, teacherMove: copy.worked, studentAction: 'Hide the final answer and predict the next move.' },
    { id: 'guided_steps', title: 'Guided practice', durationMinutes: 6, teacherMove: copy.guided, studentAction: 'Answer the prompt before looking at options or feedback.' },
    { id: 'independent_set', title: 'Independent set', durationMinutes: 8, teacherMove: copy.independent, studentAction: 'Work alone and mark the exact uncertainty.' },
    { id: 'mixed_review', title: 'Transfer review', durationMinutes: 5, teacherMove: copy.mixed, studentAction: 'Use the same routine in a different exam layer.' },
    { id: 'reflection', title: 'Reflection', durationMinutes: 2, teacherMove: copy.reflection, studentAction: 'Write one reusable rule or phrase.' },
  ];
}

function countMatches(values: string[], selected: Set<string>): number {
  if (!selected.size) return 0;
  return values.reduce((total, value) => total + (selected.has(value) ? 1 : 0), 0);
}

function buildMatchReason(input: {
  conceptMatch: number;
  skillMatch: number;
  prerequisiteMatch: number;
  textMatch: number;
  weakLabel: string;
}): string {
  if (input.skillMatch) return 'Matched weak skill from mastery data';
  if (input.conceptMatch) return 'Matched weak concept from knowledge graph';
  if (input.prerequisiteMatch) return 'Repairs prerequisite likely blocking progress';
  if (input.textMatch) return `Matched weak label: ${input.weakLabel}`;
  return 'High-risk Math 9 repair template';
}

function classifyEnglishErrorLens(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
}): EnglishCoreRemediationPlan['errorLens'] {
  const text = normalizeText([
    input.weakLabel,
    input.errorText,
    ...(input.weakConceptIds || []),
    ...(input.weakSkillIds || []),
  ].join(' '));

  if (hasAny(text, ['speaking', 'spoken', 'fluency', 'pronunciation', 'interactive', 'conversation'])) {
    return {
      area: 'speaking',
      label: 'Speaking response control',
      repairMode: 'Use answer frame, support detail, repair phrase, pronunciation target.',
      evidenceCheck: 'Record one answer and check whether the main point survives self-correction.',
    };
  }

  if (hasAny(text, ['writing', 'essay', 'paragraph', 'task response', 'coherence', 'argument'])) {
    return {
      area: 'writing',
      label: 'Writing development and revision',
      repairMode: 'Plan one paragraph, develop one idea deeply, then revise language.',
      evidenceCheck: 'Every sentence must have a visible job in the paragraph.',
    };
  }

  if (hasAny(text, ['listening', 'audio', 'speaker', 'attitude', 'heard', 'correction marker'])) {
    return {
      area: 'listening_detail',
      label: 'Listening detail and paraphrase',
      repairMode: 'Predict answer type, listen for correction, then confirm final detail.',
      evidenceCheck: 'Answer is accepted only with answer type and paraphrase evidence.',
    };
  }

  if (hasAny(text, ['inference', 'implied', 'implicit', 'argument', 'author', 'overreach', 'reading'])) {
    return {
      area: 'reading_inference',
      label: 'Reading inference',
      repairMode: 'Evidence line -> paraphrase -> safest answer; reject overreach.',
      evidenceCheck: 'Learner must name the line that supports the inference.',
    };
  }

  if (hasAny(text, ['grammar', 'sentence', 'clause', 'tense', 'aspect', 'agreement', 'punctuation', 'cohesion'])) {
    return {
      area: 'grammar',
      label: 'Grammar role mismatch',
      repairMode: 'Label sentence role before changing form, tense, connector, or punctuation.',
      evidenceCheck: 'Correction must include the grammar role and anchor word.',
    };
  }

  if (hasAny(text, ['collocation', 'phraseology', 'idiom', 'register'])) {
    return {
      area: 'collocation',
      label: 'Collocation and register',
      repairMode: 'Check phrase as a chunk, then test register and surrounding noun/verb.',
      evidenceCheck: 'Learner gives context sentence, not translation only.',
    };
  }

  return {
    area: 'vocabulary',
    label: 'Vocabulary range',
    repairMode: 'Build meaning, word family, collocation, and context sentence together.',
    evidenceCheck: 'Learner can reuse the word accurately in a new sentence.',
  };
}

function buildEnglishMicroCycle(area: EnglishCoreArea, template?: EnglishCoreLessonTemplate): string[] {
  const target = template?.title || 'English Core repair';
  const base = [
    `Diagnose: identify the exact ${area} failure from the last answer.`,
    `Repair: run ${target} for one focused micro-lesson.`,
    'Practice: complete a short independent set without hints.',
    'Transfer: reuse the same routine in another exam layer.',
    'Review: log the error lens and one reusable rule in the notebook.',
  ];
  if (area === 'writing' || area === 'speaking') {
    return [...base.slice(0, 3), 'Feedback: submit one response to AI Tutor and convert feedback into one drill.', ...base.slice(3)];
  }
  return base;
}

function buildEnglishMatchReason(input: {
  skillMatch: number;
  conceptMatch: number;
  prerequisiteMatch: number;
  textMatch: number;
  lensMatch: number;
  lensLabel: string;
}): string {
  if (input.skillMatch) return 'Matched weak English skill';
  if (input.conceptMatch) return 'Matched weak English concept';
  if (input.lensMatch) return `Matched error lens: ${input.lensLabel}`;
  if (input.prerequisiteMatch) return 'Repairs prerequisite language foundation';
  if (input.textMatch) return 'Matched error text';
  return 'Core English repair template';
}

function classifyMathErrorSplit(input: {
  weakConceptIds?: string[];
  weakSkillIds?: string[];
  weakLabel?: string;
  errorText?: string;
  templateId?: string;
  unitId?: string;
}): MathErrorSplit {
  const text = normalizeText([
    input.weakLabel,
    input.errorText,
    input.templateId,
    input.unitId,
    ...(input.weakConceptIds || []),
    ...(input.weakSkillIds || []),
  ].join(' '));

  if (hasAny(text, ['casio', 'calculator', 'bam may', 'may tinh', 'fast operation', 'shortcut', 'delta table'])) {
    return {
      channel: 'casio_fast_operation',
      label: 'CASIO / fast-operation error',
      repairMode: 'Separate calculator setup from mathematical reasoning.',
      casioCheck: 'Re-enter expression with parentheses, store intermediate result, and compare with estimate.',
      reasoningCheck: 'Before pressing calculate, write the equation/condition that the calculator is checking.',
    };
  }

  if (hasAny(text, ['geometry', 'proof', 'circle', 'duong', 'goc', 'theorem', 'cyclic', 'tangent'])) {
    return {
      channel: 'geometry_proof',
      label: 'Geometry proof reasoning',
      repairMode: 'Use fixed proof scaffold before final proof.',
      casioCheck: 'Calculator is not the main tool; only use it after the proof target is clear.',
      reasoningCheck: 'Write given, need prove, theorem candidates, and proof plan before a complete solution.',
    };
  }

  if (hasAny(text, ['word problem', 'model', 'reading', 'prompt', 'system setup', 'story'])) {
    return {
      channel: 'reading_modeling',
      label: 'Reading-to-modeling error',
      repairMode: 'Slow down the translation from text to equation.',
      casioCheck: 'Do not calculate until variables and units have been named.',
      reasoningCheck: 'Underline the requested quantity, define variables, then write equation meaning.',
    };
  }

  if (hasAny(text, ['calculation', 'arithmetic', 'sign', 'fraction', 'decimal', 'slope', 'intercept'])) {
    return {
      channel: 'calculation_slip',
      label: 'Calculation / notation slip',
      repairMode: 'Keep the same method but add a verification checkpoint.',
      casioCheck: 'Use calculator only as a check after one handwritten line.',
      reasoningCheck: 'Repeat the last legal transformation and verify sign/denominator.',
    };
  }

  if (hasAny(text, ['condition', 'domain', 'vieta', 'factor', 'simplify', 'quadratic', 'radical', 'sqrt'])) {
    return {
      channel: 'procedure_gap',
      label: 'Procedure gap',
      repairMode: 'Repair the missing step order before adding more questions.',
      casioCheck: 'Calculator answer is accepted only after condition and method choice are written.',
      reasoningCheck: 'Name the method, write prerequisite condition, then solve.',
    };
  }

  return {
    channel: 'conceptual_reasoning',
    label: 'Conceptual reasoning',
    repairMode: 'Return to concept summary and a worked example with self-explanation.',
    casioCheck: 'Use calculator only for numerical verification.',
    reasoningCheck: 'Explain why the selected theorem/formula applies before computing.',
  };
}

function buildGeometryProofScaffold(weakLabel?: string): GeometryProofScaffold {
  const focus = weakLabel && normalizeText(weakLabel).includes('trig') ? 'circle proof with trig check' : 'circle and plane-geometry proof';
  return {
    title: `Proof scaffold: ${focus}`,
    steps: [
      { prompt: 'Given', expectedMove: 'List all fixed facts from the problem and mark them on the diagram.' },
      { prompt: 'Need prove', expectedMove: 'Rewrite the exact target: equal angles, cyclic quadrilateral, parallel lines, tangent, or length relation.' },
      { prompt: 'Known theorem', expectedMove: 'Pick 2-3 candidate theorems only; do not start the full proof yet.' },
      { prompt: 'Proof plan', expectedMove: 'Create a short chain from given facts to target using named theorems.' },
      { prompt: 'Final proof', expectedMove: 'Write the proof in complete lines, each line containing fact + reason.' },
    ],
    theoremBank: [
      'Inscribed angles standing on the same arc are equal.',
      'Opposite angles in a cyclic quadrilateral sum to 180 degrees.',
      'Tangent is perpendicular to radius at the point of contact.',
      'Angle-angle similarity must be proven before using proportional lengths.',
    ],
    finalProofRule: 'No final proof is accepted unless every transformation has a named reason.',
  };
}

function buildMath1012Readiness(
  backfillUnits: MathBackfillRecommendation[],
  input: { weakConceptIds?: string[]; weakSkillIds?: string[]; retryAttempts?: number },
): Math1012Readiness {
  const targets = new Set([...(input.weakConceptIds || []), ...(input.weakSkillIds || [])]);
  const hasHighSchoolTarget = [
    'math.advanced_function',
    'math.vector_coordinate_geometry',
    'math.sequence_series',
    'math.exponential_logarithm',
    'math.calculus_foundation',
    'math.solid_geometry_advanced',
    'math.combinatorics_probability',
    'math.statistics_advanced',
    'math.analyze_advanced_function',
    'math.solve_exponential_logarithm',
    'math.differentiate_basic_function',
  ].some((id) => targets.has(id));
  const repeatedPrerequisiteSignal = (input.retryAttempts || 0) >= 2 || backfillUnits.some((item) => item.matchScore >= 6);

  if (repeatedPrerequisiteSignal && !hasHighSchoolTarget) {
    return {
      status: 'backfill_first',
      focusCluster: backfillUnits[0]?.unit.cluster || 'Math 9 prerequisite',
      guardrail: 'Hold Math 10-12 expansion for this learner until prerequisite checkpoint is stable.',
    };
  }

  if (hasHighSchoolTarget) {
    return {
      status: 'ready_for_grade10_cluster',
      focusCluster: 'Functions, vectors, sequences, logarithms, calculus foundation',
      guardrail: 'Import Math 10-12 items cluster by cluster and require conceptIds/skillIds before release.',
    };
  }

  return {
    status: 'ready_for_import',
    focusCluster: 'Math 10-12 graph is ready; question bank can be imported behind content guards.',
    guardrail: 'Do not count new Math 10-12 items toward mastery until metadata and answer validation pass.',
  };
}

function buildBackfillReason(input: {
  conceptMatch: number;
  skillMatch: number;
  prerequisiteMatch: number;
  textMatch: number;
}): string {
  if (input.skillMatch) return 'Targets weak skill';
  if (input.conceptMatch) return 'Targets weak concept';
  if (input.prerequisiteMatch) return 'Backfills prerequisite';
  if (input.textMatch) return 'Matches error text';
  return 'Core Math 9 safety net';
}

function buildMath1012ClusterReason(input: {
  conceptMatch: number;
  skillMatch: number;
  prerequisiteMatch: number;
  textMatch: number;
  status: Math1012ExpansionStatus;
}): string {
  if (input.skillMatch) return 'Upper-secondary skill match';
  if (input.conceptMatch) return 'Upper-secondary concept match';
  if (input.prerequisiteMatch) return 'Prerequisite bridge';
  if (input.textMatch) return 'Matches weak signal';
  if (input.status === 'ready_for_seed') return 'Ready seed cluster';
  if (input.status === 'import_ready') return 'Import-ready cluster';
  return 'Planned expansion';
}

function countKeywordMatches(text: string, corpus: string): number {
  if (!text) return 0;
  const keywords = text.split(/[^a-z0-9.]+/).filter((item) => item.length >= 4);
  return Math.min(3, keywords.reduce((total, keyword) => total + (corpus.includes(keyword) ? 1 : 0), 0));
}

function hasAny(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
