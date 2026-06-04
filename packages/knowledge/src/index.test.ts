import { createSeedKnowledgeGraph, prerequisiteClosure, validateKnowledgeGraph, type KnowledgeGraph } from "./index";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const seed = createSeedKnowledgeGraph();
const valid = validateKnowledgeGraph(seed);
assert(valid.ok, `Seed graph should be valid: ${valid.errors.map((error) => error.message).join(", ")}`);

const englishConceptIds = new Set(seed.concepts.filter((concept) => concept.domainId === "english_core").map((concept) => concept.id));
[
  "eng.vocabulary_range",
  "eng.word_formation",
  "eng.collocation_phraseology",
  "eng.academic_register",
  "eng.grammar_accuracy",
  "eng.sentence_structure",
  "eng.verb_tense_aspect",
  "eng.cohesion_reference",
  "eng.reading_main_idea",
  "eng.reading_detail",
  "eng.reading_inference",
  "eng.reading_argument_structure",
  "eng.listening_main_idea",
  "eng.listening_detail",
  "eng.listening_inference",
  "eng.listening_attitude",
  "eng.academic_writing",
  "eng.writing_task_response",
  "eng.paragraph_development",
  "eng.essay_coherence",
  "eng.speaking_fluency",
  "eng.pronunciation_control",
  "eng.interactive_communication",
  "eng.spoken_discourse_management",
].forEach((conceptId) => assert(englishConceptIds.has(conceptId), `English Core concept should exist: ${conceptId}`));

assert(prerequisiteClosure(seed, "eng.reading_inference").includes("eng.reading_detail"), "Reading detail should unlock reading inference.");
assert(prerequisiteClosure(seed, "eng.grammar_accuracy").includes("eng.sentence_structure"), "Sentence structure should unlock grammar accuracy.");
assert(prerequisiteClosure(seed, "math.quadratic_equation").includes("math.polynomial"), "Grade 8 polynomial should unlock Grade 9 quadratic work through factorization.");
assert(prerequisiteClosure(seed, "math.linear_equation").includes("math.linear_expression"), "Grade 7-8 linear expression should unlock linear equations.");
assert(prerequisiteClosure(seed, "math.calculus_foundation").includes("math.functions_graphs"), "Grade 9-10 function graphs should unlock calculus foundation.");
assert(prerequisiteClosure(seed, "math.irrational_equation").includes("math.radicals_expression"), "Radical expressions should unlock irrational equations.");
assert(prerequisiteClosure(seed, "math.linear_system_two_variables").includes("math.linear_equation"), "Linear equations should unlock two-variable systems.");

const ieltsMap = seed.programMaps.find((programMap) => programMap.programId === "ielts");
const mathThcsMap = seed.programMaps.find((programMap) => programMap.programId === "vn_math_thcs");
const math6Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_6");
const math7Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_7");
const math8Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_8");
const math9Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_9");
const mathExam10Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_vao_10");
const math68Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_6_8");
const math1012Map = seed.programMaps.find((programMap) => programMap.programId === "vn_math_10_12");
const satMap = seed.programMaps.find((programMap) => programMap.programId === "sat");
const caeMap = seed.programMaps.find((programMap) => programMap.programId === "cae");
const cpeMap = seed.programMaps.find((programMap) => programMap.programId === "cpe");
assert(Boolean(mathThcsMap?.objectiveIds.includes("obj.math.grade6.core")), "Math THCS should include Grade 6 core.");
assert(Boolean(mathThcsMap?.objectiveIds.includes("obj.math.vao10.core")), "Math THCS should include Grade 10 entrance path.");
assert(Boolean(math6Map?.conceptIds.includes("math.divisibility_number_theory")), "Math 6 should map divisibility and number theory.");
assert(Boolean(math7Map?.conceptIds.includes("math.triangle_geometry")), "Math 7 should map triangle geometry.");
assert(Boolean(math8Map?.conceptIds.includes("math.similarity_thales")), "Math 8 should map Thales and similarity.");
assert(Boolean(math9Map?.conceptIds.includes("math.radicals_expression")), "Math 9 should map radical expressions.");
assert(Boolean(math9Map?.conceptIds.includes("math.circle_geometry")), "Math 9 should map circle geometry.");
assert(Boolean(mathExam10Map?.conceptIds.includes("math.exam10_synthesis")), "Entrance exam map should include synthesis topic.");
assert(Boolean(mathExam10Map?.skillIds.includes("math.solve_inequality_extrema_problem")), "Entrance exam map should include advanced extrema skill.");
assert(Boolean(math68Map?.objectiveIds.includes("obj.math.grade6_8.number_foundation")), "Math 6-8 should map number foundation.");
assert(Boolean(math68Map?.skillIds.includes("math.factor_polynomial")), "Math 6-8 should include polynomial factoring bridge.");
assert(Boolean(math68Map?.objectiveIds.includes("obj.math.grade8.core")), "Math 6-8 should include the expanded Grade 8 core map.");
assert(seed.programs.find((program) => program.id === "vn_math_10_12")?.status === "active", "Math 10-12 should be active once its graph map exists.");
assert(Boolean(math1012Map?.objectiveIds.includes("obj.math.grade10.function_vector_foundation")), "Math 10-12 should map Grade 10 function/vector foundation.");
assert(Boolean(math1012Map?.objectiveIds.includes("obj.math.grade11.algebra_calculus_foundation")), "Math 10-12 should map Grade 11 algebra/calculus foundation.");
assert(Boolean(math1012Map?.objectiveIds.includes("obj.math.grade12.geometry_probability_foundation")), "Math 10-12 should map Grade 12 geometry/probability foundation.");
assert(Boolean(math1012Map?.conceptIds.includes("math.calculus_foundation")), "Math 10-12 should include calculus foundation.");
assert(Boolean(math1012Map?.skillIds.includes("math.solve_exponential_logarithm")), "Math 10-12 should include exponential/logarithm solving.");
assert(seed.concepts.find((concept) => concept.id === "math.geometry_proof")?.status === "active", "Geometry proof should be active for Math 9 remediation.");
assert(seed.concepts.find((concept) => concept.id === "math.calculator_strategy")?.status === "active", "Calculator strategy should be active for CASIO error splitting.");
assert(seed.skills.find((skill) => skill.id === "math.geometry_reasoning")?.status === "active", "Geometry reasoning skill should be active for proof scaffolds.");
assert(seed.skills.find((skill) => skill.id === "math.use_calculator_strategy")?.status === "active", "Calculator strategy skill should be active for operation checks.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.english.vocabulary_core")), "IELTS should map to English vocabulary core.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.english.reading_core")), "IELTS should map to English reading core.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.english.listening_core")), "IELTS should map to English listening core.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.ielts.reading_listening_beta")), "IELTS should expose a focused Reading/Listening beta objective.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.english.writing_core")), "IELTS should map to English writing core.");
assert(Boolean(ieltsMap?.objectiveIds.includes("obj.english.speaking_core")), "IELTS should map to English speaking core.");
assert(Boolean(satMap?.objectiveIds.includes("obj.sat.math_core")), "SAT should map to SAT Math core.");
assert(Boolean(satMap?.objectiveIds.includes("obj.sat.rw_core")), "SAT should map to SAT Reading/Writing core.");
assert(Boolean(caeMap?.objectiveIds.includes("obj.english.writing_core")), "CAE should have its own English Core map.");
assert(Boolean(caeMap?.objectiveIds.includes("obj.english.speaking_core")), "CAE should map to English speaking core.");
assert(Boolean(cpeMap?.objectiveIds.includes("obj.english.grammar_core")), "CPE should map to English grammar core.");
assert(Boolean(cpeMap?.objectiveIds.includes("obj.english.writing_core")), "CPE should map to English writing core.");
assert(Boolean(cpeMap?.objectiveIds.includes("obj.english.listening_core")), "CPE should map to English listening core.");
assert(Boolean(cpeMap?.objectiveIds.includes("obj.english.speaking_core")), "CPE should map to English speaking core.");

const lessonTemplateIds = new Set(seed.lessonTemplates.map((template) => template.id));
[
  "math9.algebra_transform.repair",
  "math9.factorization.bridge",
  "math9.quadratic_equation.repair",
  "math9.geometry_proof.scaffold",
  "math.thcs.grade6.number_foundation",
  "math.thcs.grade8.algebra_bridge",
  "math.thcs.grade9.exam10_synthesis",
  "math1012.g10.function_transform",
  "math1012.g10.vector_coordinate",
  "math1012.g10.probability_intro",
  "math1012.g11.sequence_series",
  "math1012.g11.exponential_logarithm",
  "math1012.g11.calculus_derivative",
  "math1012.g12.solid_coordinate_geometry",
  "math1012.g12.combinatorics_probability",
  "math1012.g12.exam_synthesis",
  "eng.core.vocab_collocation.precision",
  "eng.core.grammar.clause_control",
  "eng.core.reading.inference_bridge",
  "eng.core.listening.detail_map",
  "eng.core.writing.argument_cycle",
  "eng.core.speaking.response_loop",
].forEach((templateId) => assert(lessonTemplateIds.has(templateId), `Seed lesson template should exist: ${templateId}`));

const math1012TemplateIds = seed.lessonTemplates
  .filter((template) => template.tags?.some((tag) => ["math10", "math11", "math12"].includes(tag)))
  .map((template) => template.id);
assert(math1012TemplateIds.length >= 9, "Math 10-12 should expose cluster-import lesson templates.");

const logTemplate = seed.lessonTemplates.find((template) => template.id === "math1012.g11.exponential_logarithm");
assert(Boolean(logTemplate?.conceptIds.includes("math.exponential_logarithm")), "Log template should map to exponential/logarithm concept.");
assert(Boolean(logTemplate?.skillIds.includes("math.solve_exponential_logarithm")), "Log template should map to logarithm solving skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.log_domain_condition" && edge.to === "math1012.g11.exponential_logarithm" && edge.type === "remediates"),
  "Log-domain misconception should remediate directly to Grade 11 log template.",
);

const combinatoricsTemplate = seed.lessonTemplates.find((template) => template.id === "math1012.g12.combinatorics_probability");
assert(Boolean(combinatoricsTemplate?.skillIds.includes("math.count_combinatoric_cases")), "Combinatorics template should map to counting skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.combinatorics_overcount" && edge.to === "math1012.g12.combinatorics_probability" && edge.type === "remediates"),
  "Combinatorics overcount should remediate directly to Grade 12 combinatorics template.",
);

const englishCoreTemplateIds = seed.lessonTemplates
  .filter((template) => template.domainId === "english_core")
  .map((template) => template.id);
assert(englishCoreTemplateIds.length >= 6, "English Core should expose all reusable skill templates.");

const grammarTemplate = seed.lessonTemplates.find((template) => template.id === "eng.core.grammar.clause_control");
assert(Boolean(grammarTemplate?.skillIds.includes("eng.control_clause_structure")), "Grammar template should map to clause-control skill.");
assert(Boolean(grammarTemplate?.remediationObjectiveIds.includes("obj.english.grammar_core")), "Grammar template should remediate grammar core.");
assert(
  seed.edges.some((edge) => edge.from === "mis.eng.grammar_role_mismatch" && edge.to === "eng.core.grammar.clause_control" && edge.type === "remediates"),
  "Grammar misconception should remediate directly to grammar template.",
);

const speakingTemplate = seed.lessonTemplates.find((template) => template.id === "eng.core.speaking.response_loop");
assert(Boolean(speakingTemplate?.skillIds.includes("eng.manage_interactive_communication")), "Speaking template should include interaction skill.");
assert(Boolean(speakingTemplate?.skillIds.includes("eng.use_pronunciation_features")), "Speaking template should include pronunciation skill.");

const algebraTemplate = seed.lessonTemplates.find((template) => template.id === "math9.algebra_transform.repair");
assert(Boolean(algebraTemplate?.prerequisiteIds.includes("math.linear_expression")), "Math algebra repair should retain prerequisite bridge.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.missing_domain_condition" && edge.to === "math9.algebra_transform.repair" && edge.type === "remediates"),
  "Missing-domain misconception should remediate directly to algebra repair template.",
);

const misconceptionIds = new Set(seed.misconceptions.map((misconception) => misconception.id));
[
  "mis.math.factor_vs_expand",
  "mis.math.missing_domain_condition",
  "mis.math.calculation_slip",
  "mis.math.function_parameter_confusion",
  "mis.math.log_domain_condition",
  "mis.math.combinatorics_overcount",
  "mis.math.casio_operation_error",
  "mis.math.geometry_proof_gap",
  "mis.eng.grammar_role_mismatch",
  "mis.eng.collocation_literal_translation",
  "mis.eng.time_pressure_scan_skip",
  "mis.eng.speaking_fragmented_response",
  "mis.eng.speaking_interaction_breakdown",
].forEach((misconceptionId) => assert(misconceptionIds.has(misconceptionId), `Seed misconception should exist: ${misconceptionId}`));

const grammarMisconception = seed.misconceptions.find((misconception) => misconception.id === "mis.eng.grammar_role_mismatch");
assert(Boolean(grammarMisconception?.conceptIds.includes("eng.grammar_accuracy")), "Grammar misconception should map to grammar concept.");
assert(Boolean(grammarMisconception?.skillIds.includes("eng.control_clause_structure")), "Grammar misconception should map to clause-control skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.eng.grammar_role_mismatch" && edge.to === "obj.english.grammar_core" && edge.type === "remediates"),
  "Grammar misconception should remediate to English grammar core objective.",
);

const logDomainMisconception = seed.misconceptions.find((misconception) => misconception.id === "mis.math.log_domain_condition");
assert(Boolean(logDomainMisconception?.conceptIds.includes("math.exponential_logarithm")), "Log misconception should map to exponential/logarithm concept.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.log_domain_condition" && edge.to === "obj.math.grade11.algebra_calculus_foundation" && edge.type === "remediates"),
  "Log misconception should remediate to Grade 11 algebra/calculus objective.",
);

const casioMisconception = seed.misconceptions.find((misconception) => misconception.id === "mis.math.casio_operation_error");
assert(Boolean(casioMisconception?.conceptIds.includes("math.calculator_strategy")), "CASIO misconception should map to calculator strategy.");
assert(Boolean(casioMisconception?.skillIds.includes("math.use_calculator_strategy")), "CASIO misconception should map to calculator skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.casio_operation_error" && edge.to === "obj.math.grade9.miumath_pilot" && edge.type === "remediates"),
  "CASIO misconception should remediate to Math 9 pilot objective.",
);

const proofGapMisconception = seed.misconceptions.find((misconception) => misconception.id === "mis.math.geometry_proof_gap");
assert(Boolean(proofGapMisconception?.conceptIds.includes("math.geometry_proof")), "Geometry proof gap should map to geometry proof concept.");
assert(Boolean(proofGapMisconception?.skillIds.includes("math.geometry_reasoning")), "Geometry proof gap should map to geometry reasoning skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.math.geometry_proof_gap" && edge.to === "obj.math.grade9.miumath_pilot" && edge.type === "remediates"),
  "Geometry proof gap should remediate to Math 9 pilot objective.",
);

const speakingObjective = seed.objectives.find((objective) => objective.id === "obj.english.speaking_core");
assert(Boolean(speakingObjective?.conceptIds.includes("eng.interactive_communication")), "Speaking objective should cover interactive communication.");
assert(Boolean(speakingObjective?.skillIds.includes("eng.organize_spoken_response")), "Speaking objective should cover spoken response organization.");
assert(
  seed.edges.some((edge) => edge.from === "mis.eng.speaking_fragmented_response" && edge.to === "obj.english.speaking_core" && edge.type === "remediates"),
  "Speaking misconception should remediate to English speaking core objective.",
);

const ieltsRlObjective = seed.objectives.find((objective) => objective.id === "obj.ielts.reading_listening_beta");
assert(Boolean(ieltsRlObjective?.conceptIds.includes("eng.listening_detail")), "IELTS R/L beta objective should cover listening detail.");
assert(Boolean(ieltsRlObjective?.skillIds.includes("eng.identify_specific_detail")), "IELTS R/L beta objective should cover specific-detail skill.");
assert(
  seed.edges.some((edge) => edge.from === "mis.eng.inference_literal_only" && edge.to === "obj.ielts.reading_listening_beta" && edge.type === "remediates"),
  "IELTS R/L beta objective should remediate inference-literal misconception.",
);

const invalid: KnowledgeGraph = {
  ...seed,
  skills: [{ ...seed.skills[0], id: "skill.with.bad.ref", conceptIds: ["missing.concept"] }],
};

const invalidResult = validateKnowledgeGraph(invalid);
assert(!invalidResult.ok, "Invalid graph should fail validation.");
assert(invalidResult.errors.some((error) => error.code === "missing_concept"), "Missing concept should be reported.");

const invalidLessonTemplate: KnowledgeGraph = {
  ...seed,
  lessonTemplates: [{ ...seed.lessonTemplates[0], id: "lesson.invalid.skill", skillIds: ["missing.skill"] }],
};

const invalidLessonTemplateResult = validateKnowledgeGraph(invalidLessonTemplate);
assert(!invalidLessonTemplateResult.ok, "Lesson template with missing skill should fail validation.");
assert(invalidLessonTemplateResult.errors.some((error) => error.code === "missing_skill"), "Missing lesson-template skill should be reported.");

const invalidMisconception: KnowledgeGraph = {
  ...seed,
  misconceptions: [{ ...seed.misconceptions[0], id: "mis.invalid.empty", conceptIds: [], skillIds: [] }],
};

const invalidMisconceptionResult = validateKnowledgeGraph(invalidMisconception);
assert(!invalidMisconceptionResult.ok, "Misconceptions without concept/skill mappings should fail validation.");
assert(invalidMisconceptionResult.errors.some((error) => error.code === "empty_refs"), "Empty misconception references should be reported.");
