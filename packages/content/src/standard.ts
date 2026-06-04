export type ContentDomainId = 'mathematics' | 'english_core' | string;
export type ContentProgramId =
  | 'vn_math_thcs'
  | 'vn_math_6'
  | 'vn_math_7'
  | 'vn_math_8'
  | 'vn_math_9'
  | 'vn_math_6_9'
  | 'vn_math_vao_10'
  | 'vn_math_10_12'
  | 'ielts'
  | 'sat'
  | 'cae'
  | 'cpe'
  | string;
export type CognitiveLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create' | string;
export type MasteryPolicy = 'tracked' | 'feedback_only';
export type MathLearningLevel = 'foundation' | 'core' | 'application' | 'advanced' | 'hsg' | 'exam10' | string;

export interface MathQuestionMetadata {
  grade?: number;
  grades?: number[];
  strand?: string;
  topicId?: string;
  patternId?: string;
  level?: MathLearningLevel;
  examTarget?: string[];
}

export interface QuestionChoice {
  key: string;
  content: string;
}

export interface QuestionItem {
  id: string;
  sourceId?: string;
  source?: string;
  domainId: ContentDomainId;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  misconceptionIds: string[];
  type: string;
  prompt: string;
  choices?: QuestionChoice[];
  correctAnswer: string | string[] | boolean | null;
  explanation?: string | Record<string, unknown>;
  difficulty: string;
  cognitiveLevel: CognitiveLevel;
  masteryPolicy?: MasteryPolicy;
  feedbackArea?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface Lesson {
  id: string;
  domainId: ContentDomainId;
  programIds: ContentProgramId[];
  conceptIds: string[];
  skillIds: string[];
  title: string;
  summary?: string;
  body?: string;
  estimatedMinutes?: number;
  tags?: string[];
}

export interface Passage {
  id: string;
  domainId: ContentDomainId;
  programIds: ContentProgramId[];
  title?: string;
  text: string;
  source?: string;
  tags?: string[];
}

export interface MockTest {
  id: string;
  programId: ContentProgramId;
  title: string;
  questionIds: string[];
  durationMinutes?: number;
  sections?: Array<{ id: string; title: string; questionIds: string[]; durationMinutes?: number }>;
}

export interface RubricCriterion {
  id: string;
  name: string;
  levels: Array<{ score: number; descriptor: string }>;
}

export interface Rubric {
  id: string;
  programId: ContentProgramId;
  skillId: string;
  title: string;
  criteria: RubricCriterion[];
}

export type EnglishExamSkill = 'listening' | 'reading' | 'writing' | 'speaking' | 'use_of_english' | string;

export interface EnglishExamQuestion {
  id: string;
  type: string;
  instruction: string;
  options?: string[];
  blankIndex?: number;
  acceptedAnswers?: string[][];
  correctAnswer?: string | string[] | boolean | null;
  explanation?: string;
  answerLocation?: string;
  passageHtml?: string | null;
  displayMode?: 'topic' | 'test' | 'both' | string;
  category?: string;
  topic?: {
    id?: string;
    title?: string;
    skill?: string;
    program?: string;
  };
}

export interface EnglishExamQuestionGroup {
  id: string;
  instruction: string;
  questions: EnglishExamQuestion[];
  passageText?: string;
}

export interface EnglishExamSection {
  id: string;
  title: string;
  instructions: string;
  audioPath?: string;
  audioChecksum?: string;
  audioTimestamps?: Array<{ questionGroupId: string; startSecond: number; endSecond: number }>;
  passageHtml?: string;
  transcript?: string;
  questionGroups: EnglishExamQuestionGroup[];
}

export interface EnglishExamTest {
  id: string;
  title: string;
  type?: 'academic' | 'general' | string;
  skill: EnglishExamSkill;
  sections: EnglishExamSection[];
  exam?: 'ielts' | 'cpe' | 'cae' | 'sat' | string;
}

export type ContentQualitySeverity = 'blocker' | 'warning';

export interface EnglishQuestionReadinessIssue {
  code: string;
  severity: ContentQualitySeverity;
  message: string;
  path?: string;
}

export interface EnglishPilotSelectionOptions {
  learningReadyOnly?: boolean;
}

export interface MiuMathQuestion {
  id: string;
  exam_id: number;
  exam_name: string;
  type: string;
  difficulty: string;
  category: string;
  category_vn: string;
  question_text: string;
  options?: QuestionChoice[] | null;
  correct_answer: string;
  explanation: string | Record<string, unknown>;
  sub_category: string;
  sub_category_vn: string;
  image?: string;
}

interface TagMap {
  conceptIds: string[];
  skillIds: string[];
  misconceptionIds?: string[];
  cognitiveLevel?: CognitiveLevel;
  programIds?: ContentProgramId[];
  grade?: number;
  grades?: number[];
  strand?: string;
  topicId?: string;
  patternId?: string;
  level?: MathLearningLevel;
  examTarget?: string[];
}

const MIU_MATH_CATEGORY_MAP: Record<string, TagMap> = {
  'algebra-simplification': {
    conceptIds: ['math.algebraic_expression', 'math.factorization'],
    skillIds: ['math.simplify_expression', 'math.factor_common_terms'],
    misconceptionIds: ['mis.math.factor_vs_expand'],
    cognitiveLevel: 'apply',
  },
  'equations-systems': {
    conceptIds: ['math.linear_equation', 'math.quadratic_equation'],
    skillIds: ['math.solve_linear_equation', 'math.solve_system', 'math.solve_quadratic_by_factor'],
    cognitiveLevel: 'apply',
  },
  'viet-applications': {
    conceptIds: ['math.quadratic_equation', 'math.vieta'],
    skillIds: ['math.apply_vieta', 'math.solve_quadratic_by_factor'],
    cognitiveLevel: 'analyze',
  },
  'functions-graphs': {
    conceptIds: ['math.functions_graphs'],
    skillIds: ['math.analyze_function_graph'],
    cognitiveLevel: 'analyze',
  },
  'word-problems': {
    conceptIds: ['math.word_problem_modeling'],
    skillIds: ['math.model_word_problem', 'math.solve_linear_equation'],
    misconceptionIds: ['mis.math.reading_prompt_to_equation'],
    cognitiveLevel: 'analyze',
  },
  'plane-geometry': {
    conceptIds: ['math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.prove_circle_geometry', 'math.geometry_reasoning'],
    cognitiveLevel: 'analyze',
  },
  'trigonometry-practice': {
    conceptIds: ['math.trigonometry'],
    skillIds: ['math.use_trig_ratios'],
    cognitiveLevel: 'apply',
  },
  'spatial-geometry': {
    conceptIds: ['math.spatial_geometry'],
    skillIds: ['math.compute_solid_measure'],
    cognitiveLevel: 'apply',
  },
  statistics: {
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_statistics'],
    cognitiveLevel: 'analyze',
  },
  probability: {
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_probability'],
    cognitiveLevel: 'apply',
  },
  'casio-hacks': {
    conceptIds: ['math.calculator_strategy'],
    skillIds: ['math.use_calculator_strategy'],
    cognitiveLevel: 'apply',
  },
};

const MIU_MATH_SUBCATEGORY_OVERRIDES: Record<string, Partial<TagMap>> = {
  'eqsys-quadratic-core': {
    conceptIds: ['math.quadratic_equation'],
    skillIds: ['math.solve_quadratic_by_factor'],
  },
  'eqsys-linear-systems': {
    conceptIds: ['math.linear_equation'],
    skillIds: ['math.solve_system'],
  },
  'algebra-extrema-sub': {
    conceptIds: ['math.algebraic_expression'],
    skillIds: ['math.optimize_expression'],
    cognitiveLevel: 'analyze',
  },
  'func-parabola-line': {
    conceptIds: ['math.functions_graphs', 'math.quadratic_equation'],
    skillIds: ['math.analyze_function_graph'],
  },
  'plane-inscribed-quad': {
    conceptIds: ['math.plane_geometry'],
    skillIds: ['math.prove_circle_geometry'],
  },
  'stats-charts': {
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_statistics'],
  },
  'prob-simple': {
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_probability'],
  },
};

const MIU_MATH_DEFAULT_PROGRAM_IDS: ContentProgramId[] = ['vn_math_9', 'vn_math_vao_10', 'vn_math_6_9', 'vn_math_thcs'];

const MIU_MATH_CATEGORY_TAXONOMY: Record<string, Partial<TagMap>> = {
  'algebra-simplification': {
    conceptIds: ['math.radicals_expression', 'math.algebraic_expression'],
    skillIds: ['math.simplify_radical_expression', 'math.simplify_expression'],
    grade: 9,
    strand: 'algebra',
    topicId: 'math.radicals_expression',
    level: 'core',
    examTarget: ['grade9', 'vao10'],
  },
  'equations-systems': {
    conceptIds: ['math.linear_system_two_variables', 'math.quadratic_equation'],
    skillIds: ['math.solve_linear_system_two_variables', 'math.solve_quadratic_by_factor'],
    grade: 9,
    strand: 'equation',
    topicId: 'math.linear_system_two_variables',
    level: 'core',
    examTarget: ['grade9', 'vao10'],
  },
  'viet-applications': {
    conceptIds: ['math.vieta', 'math.quadratic_equation'],
    skillIds: ['math.apply_vieta'],
    grade: 9,
    strand: 'equation',
    topicId: 'math.vieta',
    level: 'exam10',
    examTarget: ['vao10'],
  },
  'functions-graphs': {
    conceptIds: ['math.functions_graphs', 'math.quadratic_function_graph'],
    skillIds: ['math.analyze_function_graph'],
    grade: 9,
    strand: 'function',
    topicId: 'math.functions_graphs',
    level: 'application',
    examTarget: ['grade9', 'vao10'],
  },
  'word-problems': {
    conceptIds: ['math.word_problem_modeling'],
    skillIds: ['math.model_word_problem'],
    grade: 9,
    strand: 'word_problem',
    topicId: 'math.word_problem_modeling',
    level: 'application',
    examTarget: ['grade9', 'vao10'],
  },
  'plane-geometry': {
    conceptIds: ['math.circle_geometry', 'math.plane_geometry', 'math.geometry_proof'],
    skillIds: ['math.use_circle_angle_metric_relations', 'math.geometry_reasoning'],
    grade: 9,
    strand: 'geometry',
    topicId: 'math.circle_geometry',
    level: 'application',
    examTarget: ['grade9', 'vao10'],
  },
  'trigonometry-practice': {
    conceptIds: ['math.right_triangle_metric_relations', 'math.trigonometry'],
    skillIds: ['math.use_right_triangle_metric_relations', 'math.use_trig_ratios'],
    grade: 9,
    strand: 'geometry',
    topicId: 'math.right_triangle_metric_relations',
    level: 'application',
    examTarget: ['grade9', 'vao10'],
  },
  'spatial-geometry': {
    conceptIds: ['math.solid_cylinder_cone_sphere', 'math.spatial_geometry'],
    skillIds: ['math.compute_cylinder_cone_sphere_measure', 'math.compute_solid_measure'],
    grade: 9,
    strand: 'spatial_geometry',
    topicId: 'math.solid_cylinder_cone_sphere',
    level: 'core',
    examTarget: ['grade9', 'vao10'],
  },
  statistics: {
    conceptIds: ['math.statistics', 'math.statistics_grouped_data'],
    skillIds: ['math.interpret_statistics'],
    grade: 9,
    strand: 'statistics',
    topicId: 'math.statistics',
    level: 'core',
    examTarget: ['grade9', 'vao10'],
  },
  probability: {
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_simple_probability', 'math.compute_probability'],
    grade: 9,
    strand: 'probability',
    topicId: 'math.probability',
    level: 'core',
    examTarget: ['grade9', 'vao10'],
  },
  'casio-hacks': {
    conceptIds: ['math.calculator_strategy'],
    skillIds: ['math.use_calculator_strategy'],
    grade: 9,
    strand: 'strategy',
    topicId: 'math.calculator_strategy',
    level: 'exam10',
    examTarget: ['vao10'],
  },
};

const MIU_MATH_SUBCATEGORY_TAXONOMY: Record<string, Partial<TagMap>> = {
  'algebra-simplification-core': {
    conceptIds: ['math.radicals_expression'],
    skillIds: ['math.simplify_radical_expression'],
    topicId: 'math.radicals_expression',
    patternId: 'math9.radicals.simplify_expression',
    level: 'core',
  },
  'algebra-evaluation': {
    conceptIds: ['math.radicals_expression'],
    skillIds: ['math.evaluate_radical_expression'],
    topicId: 'math.radicals_expression',
    patternId: 'math9.radicals.evaluate_expression',
    level: 'core',
  },
  'algebra-extrema-sub': {
    conceptIds: ['math.advanced_inequality_extrema', 'math.algebraic_expression'],
    skillIds: ['math.solve_inequality_extrema_problem', 'math.optimize_expression'],
    topicId: 'math.advanced_inequality_extrema',
    patternId: 'math9.algebra.extrema_parameter',
    level: 'advanced',
  },
  'eqsys-linear-systems': {
    conceptIds: ['math.linear_system_two_variables'],
    skillIds: ['math.solve_linear_system_two_variables'],
    topicId: 'math.linear_system_two_variables',
    patternId: 'math9.equation.linear_system_2x2',
    level: 'core',
  },
  'eqsys-quadratic-core': {
    conceptIds: ['math.quadratic_equation'],
    skillIds: ['math.solve_quadratic_by_factor'],
    topicId: 'math.quadratic_equation',
    patternId: 'math9.equation.quadratic_core',
    level: 'core',
  },
  'eqsys-irrational-high': {
    conceptIds: ['math.irrational_equation', 'math.radicals_expression'],
    skillIds: ['math.solve_irrational_equation'],
    topicId: 'math.irrational_equation',
    patternId: 'math9.equation.irrational_high',
    level: 'advanced',
  },
  'viet-expressions': {
    conceptIds: ['math.vieta'],
    skillIds: ['math.apply_vieta'],
    topicId: 'math.vieta',
    patternId: 'math9.vieta.symmetric_expressions',
    level: 'exam10',
  },
  'viet-parameter-m': {
    conceptIds: ['math.vieta'],
    skillIds: ['math.apply_vieta'],
    topicId: 'math.vieta',
    patternId: 'math9.vieta.parameter_m',
    level: 'exam10',
  },
  'viet-signs': {
    conceptIds: ['math.vieta'],
    skillIds: ['math.apply_vieta'],
    topicId: 'math.vieta',
    patternId: 'math9.vieta.root_signs',
    level: 'exam10',
  },
  'func-linear-core': {
    conceptIds: ['math.linear_function', 'math.functions_graphs'],
    skillIds: ['math.analyze_linear_function'],
    topicId: 'math.linear_function',
    patternId: 'math9.function.linear_graph',
    level: 'core',
  },
  'func-parabola-line': {
    conceptIds: ['math.quadratic_function_graph', 'math.quadratic_equation'],
    skillIds: ['math.analyze_parabola_line_intersection'],
    topicId: 'math.quadratic_function_graph',
    patternId: 'math9.function.parabola_line_intersection',
    level: 'exam10',
  },
  'func-coordinate-geometry': {
    conceptIds: ['math.coordinate_geometry', 'math.functions_graphs'],
    skillIds: ['math.solve_coordinate_geometry_problem'],
    topicId: 'math.coordinate_geometry',
    patternId: 'math9.function.coordinate_geometry',
    level: 'application',
  },
  'word-motion': {
    conceptIds: ['math.word_problem_modeling'],
    skillIds: ['math.model_motion_problem', 'math.model_word_problem'],
    topicId: 'math.word_problem_modeling',
    patternId: 'math9.word_problem.motion',
    level: 'application',
  },
  'word-productivity': {
    conceptIds: ['math.word_problem_modeling'],
    skillIds: ['math.model_productivity_problem', 'math.model_word_problem'],
    topicId: 'math.word_problem_modeling',
    patternId: 'math9.word_problem.productivity',
    level: 'application',
  },
  'word-math-practical': {
    conceptIds: ['math.word_problem_modeling', 'math.percent_practical'],
    skillIds: ['math.model_practical_arithmetic_problem', 'math.model_word_problem'],
    topicId: 'math.word_problem_modeling',
    patternId: 'math9.word_problem.practical_arithmetic',
    level: 'application',
  },
  'plane-angles-metrics': {
    conceptIds: ['math.circle_geometry', 'math.right_triangle_metric_relations'],
    skillIds: ['math.use_circle_angle_metric_relations'],
    topicId: 'math.circle_geometry',
    patternId: 'math9.geometry.circle_angles_metrics',
    level: 'application',
  },
  'plane-inscribed-quad': {
    conceptIds: ['math.inscribed_quadrilateral', 'math.circle_geometry'],
    skillIds: ['math.prove_inscribed_quadrilateral', 'math.prove_circle_geometry'],
    topicId: 'math.inscribed_quadrilateral',
    patternId: 'math9.geometry.inscribed_quadrilateral',
    level: 'exam10',
  },
  'plane-tangents-properties': {
    conceptIds: ['math.tangent_secant_geometry', 'math.circle_geometry'],
    skillIds: ['math.prove_tangent_secant_relations', 'math.geometry_reasoning'],
    topicId: 'math.tangent_secant_geometry',
    patternId: 'math9.geometry.tangent_secant',
    level: 'exam10',
  },
  'trig-metrics-ratios': {
    conceptIds: ['math.right_triangle_metric_relations', 'math.trigonometry'],
    skillIds: ['math.use_right_triangle_metric_relations', 'math.use_trig_ratios'],
    topicId: 'math.right_triangle_metric_relations',
    patternId: 'math9.trig.metric_ratios',
    level: 'core',
  },
  'trig-height-distance': {
    conceptIds: ['math.trigonometry', 'math.word_problem_modeling'],
    skillIds: ['math.model_height_distance_trig'],
    topicId: 'math.trigonometry',
    patternId: 'math9.trig.height_distance',
    level: 'application',
  },
  'spatial-cylinder': {
    conceptIds: ['math.solid_cylinder_cone_sphere'],
    skillIds: ['math.compute_cylinder_cone_sphere_measure'],
    topicId: 'math.solid_cylinder_cone_sphere',
    patternId: 'math9.spatial.cylinder',
    level: 'core',
  },
  'spatial-cone': {
    conceptIds: ['math.solid_cylinder_cone_sphere'],
    skillIds: ['math.compute_cylinder_cone_sphere_measure'],
    topicId: 'math.solid_cylinder_cone_sphere',
    patternId: 'math9.spatial.cone',
    level: 'core',
  },
  'spatial-sphere-pyramid': {
    conceptIds: ['math.solid_cylinder_cone_sphere', 'math.spatial_geometry'],
    skillIds: ['math.compute_cylinder_cone_sphere_measure', 'math.compute_solid_measure'],
    topicId: 'math.solid_cylinder_cone_sphere',
    patternId: 'math9.spatial.sphere_pyramid',
    level: 'application',
  },
  'stats-charts': {
    conceptIds: ['math.statistics'],
    skillIds: ['math.interpret_charts', 'math.interpret_statistics'],
    topicId: 'math.statistics',
    patternId: 'math9.statistics.charts',
    level: 'core',
  },
  'stats-tables-metrics': {
    conceptIds: ['math.statistics_grouped_data', 'math.statistics'],
    skillIds: ['math.interpret_grouped_frequency_table', 'math.interpret_statistics'],
    topicId: 'math.statistics_grouped_data',
    patternId: 'math9.statistics.grouped_tables_metrics',
    level: 'core',
  },
  'prob-simple': {
    conceptIds: ['math.probability'],
    skillIds: ['math.compute_simple_probability', 'math.compute_probability'],
    topicId: 'math.probability',
    patternId: 'math9.probability.simple_event',
    level: 'core',
  },
  'prob-experimental': {
    conceptIds: ['math.experimental_probability', 'math.probability'],
    skillIds: ['math.estimate_experimental_probability', 'math.compute_probability'],
    topicId: 'math.experimental_probability',
    patternId: 'math9.probability.experimental',
    level: 'application',
  },
  'casio-algebra': {
    conceptIds: ['math.calculator_strategy'],
    skillIds: ['math.use_calculator_strategy'],
    topicId: 'math.calculator_strategy',
    patternId: 'math9.strategy.casio_algebra',
    level: 'exam10',
  },
};

const ENGLISH_SKILL_MAP: Record<string, TagMap> = {
  listening: {
    conceptIds: ['eng.listening_main_idea', 'eng.listening_detail', 'eng.listening_inference'],
    skillIds: ['eng.identify_listening_main_idea', 'eng.identify_specific_detail', 'eng.infer_speaker_attitude'],
    cognitiveLevel: 'understand',
  },
  reading: {
    conceptIds: ['eng.reading_inference', 'eng.vocabulary_range'],
    skillIds: ['eng.infer_implicit_meaning', 'eng.use_collocation'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  use_of_english: {
    conceptIds: ['eng.grammar_accuracy', 'eng.vocabulary_range'],
    skillIds: ['eng.control_clause_structure', 'eng.use_collocation'],
    cognitiveLevel: 'apply',
  },
  writing: {
    conceptIds: ['eng.academic_writing', 'eng.writing_task_response', 'eng.paragraph_development', 'eng.essay_coherence', 'eng.grammar_accuracy'],
    skillIds: ['eng.develop_academic_argument', 'eng.plan_essay_response', 'eng.develop_body_paragraph', 'eng.revise_for_coherence', 'eng.control_clause_structure'],
    cognitiveLevel: 'create',
  },
  speaking: {
    conceptIds: ['eng.speaking_fluency', 'eng.pronunciation_control', 'eng.interactive_communication', 'eng.spoken_discourse_management', 'eng.vocabulary_range', 'eng.grammar_accuracy'],
    skillIds: ['eng.organize_spoken_response', 'eng.sustain_fluent_turn', 'eng.manage_interactive_communication', 'eng.use_pronunciation_features', 'eng.use_collocation', 'eng.control_clause_structure'],
    cognitiveLevel: 'create',
  },
};

const ENGLISH_QUESTION_TYPE_OVERRIDES: Record<string, Partial<TagMap>> = {
  true_false_not_given: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  matching_headings: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  gapped_text: {
    conceptIds: ['eng.reading_inference', 'eng.grammar_accuracy'],
    skillIds: ['eng.infer_implicit_meaning', 'eng.control_clause_structure'],
    cognitiveLevel: 'analyze',
  },
  multiple_matching: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  gap_fill: {
    conceptIds: ['eng.vocabulary_range', 'eng.grammar_accuracy'],
    skillIds: ['eng.use_collocation', 'eng.control_clause_structure'],
    cognitiveLevel: 'apply',
  },
  table_completion: {
    conceptIds: ['eng.listening_detail'],
    skillIds: ['eng.identify_specific_detail'],
    cognitiveLevel: 'understand',
  },
  map_labeling: {
    conceptIds: ['eng.listening_detail'],
    skillIds: ['eng.identify_specific_detail'],
    cognitiveLevel: 'understand',
  },
};

const ENGLISH_TOPIC_OVERRIDES: Record<string, Partial<TagMap>> = {
  cae_reading_part_1: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_2: {
    conceptIds: ['eng.reading_inference', 'eng.grammar_accuracy'],
    skillIds: ['eng.infer_implicit_meaning', 'eng.control_clause_structure'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_3: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_4: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_5: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    misconceptionIds: ['mis.eng.inference_literal_only'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_6: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_7: {
    conceptIds: ['eng.reading_inference', 'eng.grammar_accuracy'],
    skillIds: ['eng.infer_implicit_meaning', 'eng.control_clause_structure'],
    cognitiveLevel: 'analyze',
  },
  cae_reading_part_8: {
    conceptIds: ['eng.reading_inference'],
    skillIds: ['eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  cae_use_of_english_part_1: {
    conceptIds: ['eng.vocabulary_range'],
    skillIds: ['eng.use_collocation'],
    cognitiveLevel: 'apply',
  },
  cae_use_of_english_part_2: {
    conceptIds: ['eng.grammar_accuracy'],
    skillIds: ['eng.control_clause_structure'],
    cognitiveLevel: 'apply',
  },
  cae_use_of_english_part_3: {
    conceptIds: ['eng.vocabulary_range', 'eng.grammar_accuracy'],
    skillIds: ['eng.use_collocation', 'eng.control_clause_structure'],
    cognitiveLevel: 'apply',
  },
  cae_use_of_english_part_4: {
    conceptIds: ['eng.grammar_accuracy', 'eng.vocabulary_range'],
    skillIds: ['eng.control_clause_structure', 'eng.use_collocation'],
    cognitiveLevel: 'apply',
  },
  cae_use_of_english_part_5: {
    conceptIds: ['eng.grammar_accuracy', 'eng.vocabulary_range'],
    skillIds: ['eng.control_clause_structure', 'eng.use_collocation'],
    cognitiveLevel: 'apply',
  },
  cae_use_of_english_part_6: {
    conceptIds: ['eng.grammar_accuracy', 'eng.reading_inference'],
    skillIds: ['eng.control_clause_structure', 'eng.infer_implicit_meaning'],
    cognitiveLevel: 'analyze',
  },
  cae_use_of_english_error_correction: {
    conceptIds: ['eng.grammar_accuracy'],
    skillIds: ['eng.control_clause_structure'],
    cognitiveLevel: 'analyze',
  },
  cae_listening_part_1: {
    conceptIds: ['eng.listening_main_idea', 'eng.listening_detail', 'eng.listening_inference'],
    skillIds: ['eng.identify_listening_main_idea', 'eng.identify_specific_detail', 'eng.infer_speaker_attitude'],
    cognitiveLevel: 'understand',
  },
  cae_listening_part_2: {
    conceptIds: ['eng.listening_detail'],
    skillIds: ['eng.identify_specific_detail'],
    cognitiveLevel: 'understand',
  },
  cae_listening_part_3: {
    conceptIds: ['eng.listening_main_idea', 'eng.listening_detail', 'eng.listening_inference'],
    skillIds: ['eng.identify_listening_main_idea', 'eng.identify_specific_detail', 'eng.infer_speaker_attitude'],
    cognitiveLevel: 'understand',
  },
  cae_listening_part_4: {
    conceptIds: ['eng.listening_detail', 'eng.listening_inference'],
    skillIds: ['eng.identify_specific_detail', 'eng.infer_speaker_attitude'],
    cognitiveLevel: 'analyze',
  },
};

export function toQuestionItemFromMiuMath(question: MiuMathQuestion): QuestionItem {
  const base = MIU_MATH_CATEGORY_MAP[question.category] || {
    conceptIds: ['math.untagged'],
    skillIds: ['math.untagged'],
    cognitiveLevel: 'apply',
  };
  const override = MIU_MATH_SUBCATEGORY_OVERRIDES[question.sub_category] || {};
  const taxonomy = inferMiuMathTaxonomy(question);
  const conceptIds = uniqueStrings([
    ...base.conceptIds,
    ...(override.conceptIds || []),
    ...(taxonomy.conceptIds || []),
  ]);
  const skillIds = uniqueStrings([
    ...base.skillIds,
    ...(override.skillIds || []),
    ...(taxonomy.skillIds || []),
  ]);
  const misconceptionIds = uniqueStrings([...(base.misconceptionIds || []), ...(override.misconceptionIds || []), ...(taxonomy.misconceptionIds || [])]);
  const programIds = uniqueStrings([
    ...MIU_MATH_DEFAULT_PROGRAM_IDS,
    ...(base.programIds || []),
    ...(override.programIds || []),
    ...(taxonomy.programIds || []),
  ]);
  const grade = taxonomy.grade ?? override.grade ?? base.grade ?? 9;
  const grades = uniqueNumbers([...(taxonomy.grades || []), ...(override.grades || []), ...(base.grades || []), grade]);
  const strand = taxonomy.strand || override.strand || base.strand || question.category;
  const topicId = taxonomy.topicId || override.topicId || base.topicId || question.category;
  const patternId = taxonomy.patternId || override.patternId || base.patternId || question.sub_category;
  const level = taxonomy.level || override.level || base.level || 'core';
  const examTarget = uniqueStrings([...(base.examTarget || []), ...(override.examTarget || []), ...(taxonomy.examTarget || []), 'grade9', 'vao10']);

  return {
    id: `miumath.${question.id}`,
    sourceId: question.id,
    source: 'miumath',
    domainId: 'mathematics',
    programIds,
    conceptIds,
    skillIds,
    misconceptionIds,
    type: question.type,
    prompt: question.question_text,
    choices: Array.isArray(question.options) ? question.options : undefined,
    correctAnswer: question.correct_answer,
    explanation: question.explanation,
    difficulty: normalizeDifficulty(question.difficulty),
    cognitiveLevel: taxonomy.cognitiveLevel || override.cognitiveLevel || base.cognitiveLevel || 'apply',
    tags: uniqueStrings([
      question.category,
      question.sub_category,
      question.exam_name,
      `grade:${grade}`,
      `strand:${strand}`,
      `topic:${topicId}`,
      `pattern:${patternId}`,
      `level:${level}`,
    ]),
    metadata: {
      examId: question.exam_id,
      examName: question.exam_name,
      grade,
      grades,
      strand,
      topicId,
      patternId,
      level,
      examTarget,
      learningPathScope: 'math_thcs',
      category: question.category,
      categoryVn: question.category_vn,
      subCategory: question.sub_category,
      subCategoryVn: question.sub_category_vn,
      image: question.image || '',
    },
  };
}

export function toQuestionItemsFromMiuMath(questions: MiuMathQuestion[]): QuestionItem[] {
  return questions.map(toQuestionItemFromMiuMath);
}

export function selectMiuMathPilotQuestions(questions: MiuMathQuestion[], limit = 50): QuestionItem[] {
  const tagged = toQuestionItemsFromMiuMath(questions);
  const selected: QuestionItem[] = [];
  const categoryCounts = new Map<string, number>();
  const ordered = [...tagged].sort((a, b) => difficultyRank(b.difficulty) - difficultyRank(a.difficulty));

  for (const question of ordered) {
    const category = String(question.metadata?.category || 'unknown');
    const count = categoryCounts.get(category) || 0;
    if (count >= 6) continue;
    selected.push(question);
    categoryCounts.set(category, count + 1);
    if (selected.length >= limit) return selected;
  }

  for (const question of tagged) {
    if (!selected.some((item) => item.id === question.id)) selected.push(question);
    if (selected.length >= limit) break;
  }

  return selected;
}

export function toQuestionItemFromEnglishExam(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
): QuestionItem {
  const programId = inferEnglishProgramId(test);
  const tagMap = inferEnglishTagMap(test, section, group, question);
  const choices = toQuestionChoices(question.options);
  const prompt = [group.instruction, question.instruction].filter(Boolean).join('\n\n');
  const feedbackOnly = isFeedbackOnlyEnglishSkill(test.skill);
  const skillArea = inferEnglishSkillArea(test, section, question);
  const topicId = inferEnglishTopicId(question);
  const topicTitle = inferEnglishTopicTitle(question, section);

  return {
    id: buildEnglishQuestionItemId(programId, test, section, group, question),
    sourceId: question.id,
    source: `${programId}_mock`,
    domainId: 'english_core',
    programIds: [programId],
    conceptIds: tagMap.conceptIds,
    skillIds: tagMap.skillIds,
    misconceptionIds: tagMap.misconceptionIds || [],
    type: question.type,
    prompt,
    choices: choices.length ? choices : undefined,
    correctAnswer: question.correctAnswer ?? question.acceptedAnswers?.[0]?.[0] ?? null,
    explanation: question.explanation,
    difficulty: inferEnglishDifficulty(test),
    cognitiveLevel: tagMap.cognitiveLevel || 'apply',
    masteryPolicy: feedbackOnly ? 'feedback_only' : 'tracked',
    feedbackArea: feedbackOnly ? String(test.skill).toLowerCase() : undefined,
    tags: uniqueStrings([
      programId,
      test.skill,
      test.type || '',
      section.title,
      group.id,
      question.type,
      question.category || '',
      topicId ? `topic:${topicId}` : '',
      question.displayMode || '',
    ]),
    metadata: {
      testId: test.id,
      testTitle: test.title,
      testSkill: test.skill,
      skillArea,
      testType: test.type || '',
      sectionId: section.id,
      sectionTitle: section.title,
      groupId: group.id,
      groupInstruction: group.instruction,
      acceptedAnswers: question.acceptedAnswers || [],
      answerLocation: question.answerLocation || '',
      displayMode: question.displayMode || 'both',
      category: question.category || '',
      topicId,
      topicTitle,
      blankIndex: question.blankIndex || null,
      audioPath: section.audioPath || '',
      audioChecksum: section.audioChecksum || '',
    },
  };
}

export function toQuestionItemsFromEnglishExam(test: EnglishExamTest): QuestionItem[] {
  const items: QuestionItem[] = [];
  for (const section of test.sections || []) {
    for (const group of section.questionGroups || []) {
      for (const question of group.questions || []) {
        items.push(toQuestionItemFromEnglishExam(test, section, group, question));
      }
    }
  }
  return items;
}

export function toMockTestFromEnglishExam(test: EnglishExamTest): MockTest {
  const programId = inferEnglishProgramId(test);
  const sections = (test.sections || []).map((section) => {
    const questionIds = (section.questionGroups || []).flatMap((group) =>
      (group.questions || []).map((question) => buildEnglishQuestionItemId(programId, test, section, group, question)),
    );
    return {
      id: `${programId}.${test.id}.${section.id}`,
      title: section.title,
      questionIds,
    };
  });

  return {
    id: `${programId}.${test.id}`,
    programId,
    title: test.title,
    questionIds: sections.flatMap((section) => section.questionIds),
    durationMinutes: inferEnglishDurationMinutes(test),
    sections,
  };
}

export function toPassagesFromEnglishExam(test: EnglishExamTest): Passage[] {
  const programId = inferEnglishProgramId(test);
  const passages: Passage[] = [];
  for (const section of test.sections || []) {
    const text = section.passageHtml || section.transcript || '';
    if (!text.trim()) continue;
    passages.push({
      id: `${programId}.${test.id}.${section.id}.passage`,
      domainId: 'english_core',
      programIds: [programId],
      title: section.title,
      text,
      source: `${programId}_mock`,
      tags: uniqueStrings([programId, test.skill, section.id, section.audioPath ? 'audio' : 'passage']),
    });
  }
  return passages;
}

export function selectEnglishPilotQuestions(tests: EnglishExamTest[], limit = 80, options: EnglishPilotSelectionOptions = {}): QuestionItem[] {
  const learningReadyOnly = options.learningReadyOnly ?? true;
  const items = tests.flatMap((test) => toQuestionItemsFromEnglishExamForPilot(test, learningReadyOnly));
  const selected: QuestionItem[] = [];
  const skillCounts = new Map<string, number>();
  const programCounts = new Map<string, number>();

  for (const item of items) {
    const skill = String(item.metadata?.testSkill || 'unknown');
    const program = item.programIds[0] || 'unknown';
    if ((skillCounts.get(skill) || 0) >= Math.ceil(limit / 2)) continue;
    if ((programCounts.get(program) || 0) >= Math.ceil(limit * 0.7)) continue;
    selected.push(item);
    skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    programCounts.set(program, (programCounts.get(program) || 0) + 1);
    if (selected.length >= limit) return selected;
  }

  for (const item of items) {
    if (!selected.some((selectedItem) => selectedItem.id === item.id)) selected.push(item);
    if (selected.length >= limit) break;
  }

  return selected;
}

export function getEnglishQuestionLearningReadinessIssues(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
): EnglishQuestionReadinessIssue[] {
  const issues: EnglishQuestionReadinessIssue[] = [];
  const questionPrefix = `tests.${test.id || 'unknown'}.sections.${section.id || 'unknown'}.groups.${group.id || 'unknown'}.questions.${question.id || 'unknown'}`;

  if (!String(question.id || '').trim()) {
    issues.push({ code: 'missing_question_id', severity: 'blocker', path: `${questionPrefix}.id`, message: 'Question id is required.' });
  }
  if (!String(question.type || '').trim()) {
    issues.push({ code: 'missing_question_type', severity: 'blocker', path: `${questionPrefix}.type`, message: 'Question type is required.' });
  }
  if (!String(question.instruction || '').trim()) {
    issues.push({ code: 'missing_instruction', severity: 'blocker', path: `${questionPrefix}.instruction`, message: 'Question instruction is required.' });
  }

  if (!hasAnswerKey(question)) {
    issues.push({ code: 'missing_answer_key', severity: 'blocker', path: `${questionPrefix}.correctAnswer`, message: 'Question needs correctAnswer or acceptedAnswers before it can affect mastery.' });
  }

  if (requiresOptions(question.type) && (!Array.isArray(question.options) || question.options.filter((option) => String(option || '').trim()).length < 2)) {
    issues.push({ code: 'missing_options', severity: 'blocker', path: `${questionPrefix}.options`, message: `${question.type} needs at least two non-empty options.` });
  }

  const skillArea = inferEnglishSkillArea(test, section, question);
  const hasReadingContent = Boolean(section.passageHtml?.trim() || group.passageText?.trim() || question.passageHtml?.trim());
  if (skillArea === 'reading' && !hasReadingContent) {
    issues.push({ code: 'missing_reading_content', severity: 'blocker', path: `${questionPrefix}.passage`, message: 'Reading question needs passageHtml, group passageText, or question passageHtml.' });
  }

  const hasListeningContent = Boolean(section.transcript?.trim() || section.audioPath?.trim());
  if (skillArea === 'listening' && !hasListeningContent && !isListeningTopicPracticeQuestion(test, question)) {
    issues.push({ code: 'missing_listening_content', severity: 'blocker', path: `${questionPrefix}.audio`, message: 'Listening question needs transcript or audioPath.' });
  }

  if (!String(question.explanation || '').trim()) {
    issues.push({ code: 'missing_explanation', severity: 'warning', path: `${questionPrefix}.explanation`, message: 'Explanation is missing, review quality will be weaker.' });
  }

  if ((skillArea === 'reading' || skillArea === 'listening') && !String(question.answerLocation || '').trim()) {
    issues.push({ code: 'missing_answer_location', severity: 'warning', path: `${questionPrefix}.answerLocation`, message: 'Answer location is missing, source-based review will be weaker.' });
  }

  return issues;
}

export function isEnglishQuestionLearningReady(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
): boolean {
  return !getEnglishQuestionLearningReadinessIssues(test, section, group, question).some((issue) => issue.severity === 'blocker');
}

function normalizeDifficulty(value: string): string {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') return normalized;
  return normalized || 'medium';
}

function difficultyRank(value: string): number {
  const normalized = normalizeDifficulty(value);
  if (normalized === 'hard') return 3;
  if (normalized === 'medium') return 2;
  return 1;
}

function inferMiuMathTaxonomy(question: MiuMathQuestion): Partial<TagMap> {
  const categoryTaxonomy = MIU_MATH_CATEGORY_TAXONOMY[question.category] || {};
  const subCategoryTaxonomy = MIU_MATH_SUBCATEGORY_TAXONOMY[question.sub_category] || {};
  return {
    ...categoryTaxonomy,
    ...subCategoryTaxonomy,
    conceptIds: uniqueStrings([...(categoryTaxonomy.conceptIds || []), ...(subCategoryTaxonomy.conceptIds || [])]),
    skillIds: uniqueStrings([...(categoryTaxonomy.skillIds || []), ...(subCategoryTaxonomy.skillIds || [])]),
    misconceptionIds: uniqueStrings([...(categoryTaxonomy.misconceptionIds || []), ...(subCategoryTaxonomy.misconceptionIds || [])]),
    programIds: uniqueStrings([...(categoryTaxonomy.programIds || []), ...(subCategoryTaxonomy.programIds || [])]),
    grades: uniqueNumbers([...(categoryTaxonomy.grades || []), ...(subCategoryTaxonomy.grades || []), categoryTaxonomy.grade, subCategoryTaxonomy.grade]),
    examTarget: uniqueStrings([...(categoryTaxonomy.examTarget || []), ...(subCategoryTaxonomy.examTarget || [])]),
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function uniqueNumbers(values: Array<number | undefined>): number[] {
  return [...new Set(values.filter((value): value is number => Number.isFinite(value)))];
}

function inferEnglishProgramId(test: EnglishExamTest): ContentProgramId {
  const explicit = String(test.exam || '').trim().toLowerCase();
  if (explicit === 'ielts' || explicit === 'cpe' || explicit === 'cae' || explicit === 'sat') return explicit;
  const text = `${test.id} ${test.title}`.toLowerCase();
  if (text.includes('cpe') || text.includes('proficiency')) return 'cpe';
  if (text.includes('cae') || text.includes('advanced')) return 'cae';
  if (text.includes('sat')) return 'sat';
  return 'ielts';
}

function inferEnglishTagMap(
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
): TagMap {
  const base = ENGLISH_SKILL_MAP[test.skill] || ENGLISH_SKILL_MAP.reading;
  const typeOverride = ENGLISH_QUESTION_TYPE_OVERRIDES[question.type] || {};
  const topicOverride = ENGLISH_TOPIC_OVERRIDES[inferEnglishTopicId(question)] || {};
  const text = `${test.skill} ${section.title} ${group.instruction} ${question.instruction} ${question.category || ''}`.toLowerCase();
  const lexicalOrGrammar =
    text.includes('cloze') ||
    text.includes('word formation') ||
    text.includes('key word') ||
    text.includes('gap') ||
    text.includes('grammar') ||
    text.includes('collocation') ||
    text.includes('use_of_english');

  const listeningDetail = test.skill === 'listening' || text.includes('map') || text.includes('form detail');
  const override = listeningDetail
    ? ENGLISH_SKILL_MAP.listening
    : lexicalOrGrammar && (inferEnglishProgramId(test) === 'cpe' || inferEnglishProgramId(test) === 'cae' || test.skill === 'use_of_english')
      ? ENGLISH_SKILL_MAP.use_of_english
      : typeOverride;

  return mergeTagMaps(base, override, typeOverride, topicOverride);
}

function inferEnglishSkillArea(test: EnglishExamTest, section: EnglishExamSection, question: EnglishExamQuestion): string {
  const explicitSkill = String(test.skill || 'reading').toLowerCase();
  if (explicitSkill !== 'reading') return explicitSkill;

  const programId = inferEnglishProgramId(test);
  const category = String(question.category || '').toLowerCase();
  const topicSkill = String(question.topic?.skill || '').toLowerCase();
  if (topicSkill === 'listening' || category.includes('_listening_')) return 'listening';
  if (topicSkill === 'reading' || category.includes('_reading_')) return 'reading';
  if (topicSkill === 'use_of_english' || category.includes('use_of_english')) return 'use_of_english';

  const text = `${section.title || ''} ${section.instructions || ''} ${question.category || ''} ${question.type || ''}`.toLowerCase();
  const cambridgeUseOfEnglish =
    (programId === 'cpe' || programId === 'cae') &&
    (/\bpart\s*[1-4]\b/.test(text) ||
      /cpe_part_[1-4]|cae_part_[1-4]/.test(text) ||
      text.includes('cloze') ||
      text.includes('word formation') ||
      text.includes('key word transformation'));

  return cambridgeUseOfEnglish ? 'use_of_english' : explicitSkill;
}

function inferEnglishTopicId(question: EnglishExamQuestion): string {
  return String(question.topic?.id || question.category || '').trim();
}

function inferEnglishTopicTitle(question: EnglishExamQuestion, section: EnglishExamSection): string {
  return String(question.topic?.title || section.title || question.category || '').trim();
}

function mergeTagMaps(...maps: Array<Partial<TagMap> | undefined>): TagMap {
  const presentMaps = maps.filter(Boolean) as Partial<TagMap>[];
  return {
    conceptIds: uniqueStrings(presentMaps.flatMap((map) => map.conceptIds || [])),
    skillIds: uniqueStrings(presentMaps.flatMap((map) => map.skillIds || [])),
    misconceptionIds: uniqueStrings(presentMaps.flatMap((map) => map.misconceptionIds || [])),
    cognitiveLevel: [...presentMaps].reverse().find((map) => map.cognitiveLevel)?.cognitiveLevel || 'apply',
  };
}

function isListeningTopicPracticeQuestion(test: EnglishExamTest, question: EnglishExamQuestion): boolean {
  const testMode = String((test as { displayMode?: string }).displayMode || '').toLowerCase();
  const questionMode = String(question.displayMode || '').toLowerCase();
  const hasStudyContent = Boolean(question.passageHtml?.trim() || question.explanation?.trim());
  return String(test.skill || '').toLowerCase() === 'listening' && hasStudyContent && (testMode === 'topic' || questionMode === 'topic');
}

function inferEnglishDifficulty(test: EnglishExamTest): string {
  const programId = inferEnglishProgramId(test);
  if (programId === 'cpe') return 'hard';
  if (programId === 'cae') return 'hard';
  if (test.skill === 'writing' || test.skill === 'speaking') return 'hard';
  return 'medium';
}

function isFeedbackOnlyEnglishSkill(skill: EnglishExamSkill): boolean {
  const normalized = String(skill || '').trim().toLowerCase();
  return normalized === 'writing' || normalized === 'speaking';
}

function inferEnglishDurationMinutes(test: EnglishExamTest): number {
  const programId = inferEnglishProgramId(test);
  if (test.skill === 'listening') return programId === 'ielts' ? 30 : 40;
  if (test.skill === 'reading') return programId === 'ielts' ? 60 : 90;
  if (test.skill === 'writing') return programId === 'ielts' ? 60 : 90;
  if (test.skill === 'speaking') return 15;
  return 60;
}

function buildEnglishQuestionItemId(
  programId: ContentProgramId,
  test: EnglishExamTest,
  section: EnglishExamSection,
  group: EnglishExamQuestionGroup,
  question: EnglishExamQuestion,
): string {
  return ['english', programId, test.id, section.id, group.id, question.id].map(slugComponent).join('.');
}

function toQuestionChoices(options: string[] = []): QuestionChoice[] {
  return options.map((option, index) => {
    const text = String(option || '').trim();
    const match = text.match(/^([A-Z]|[ivxlcdm]+)[.)]\s*(.+)$/i);
    return {
      key: match?.[1] || String.fromCharCode(65 + index),
      content: match?.[2] || text,
    };
  });
}

function slugComponent(value: string): string {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function toQuestionItemsFromEnglishExamForPilot(test: EnglishExamTest, learningReadyOnly: boolean): QuestionItem[] {
  const items: QuestionItem[] = [];
  for (const section of test.sections || []) {
    for (const group of section.questionGroups || []) {
      for (const question of group.questions || []) {
        if (learningReadyOnly && !isEnglishQuestionLearningReady(test, section, group, question)) continue;
        items.push(toQuestionItemFromEnglishExam(test, section, group, question));
      }
    }
  }
  return items;
}

function requiresOptions(type: string): boolean {
  return ['multiple_choice', 'multiple_select', 'matching_headings', 'map_labeling', 'gapped_text', 'multiple_matching'].includes(String(type || ''));
}

function hasAnswerKey(question: EnglishExamQuestion): boolean {
  if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
    if (Array.isArray(question.correctAnswer)) return question.correctAnswer.some((answer) => String(answer || '').trim());
    if (typeof question.correctAnswer === 'boolean') return true;
    return String(question.correctAnswer).trim().length > 0;
  }
  return Boolean(question.acceptedAnswers?.some((group) => group.some((answer) => String(answer || '').trim())));
}
