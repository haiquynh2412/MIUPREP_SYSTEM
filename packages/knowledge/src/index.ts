export const KNOWLEDGE_GRAPH_SCHEMA_VERSION = "knowledge_graph_v1";

export type KnowledgeStatus = "draft" | "reviewed" | "active" | "deprecated";
export type DomainKind = "mathematics" | "english_core" | "cross_domain" | string;
export type ProgramKind = "curriculum" | "exam" | "certification" | "diagnostic" | string;
export type KnowledgeEdgeType =
  | "prerequisite"
  | "part_of"
  | "supports"
  | "assesses"
  | "remediates"
  | "overlaps";

export interface Domain {
  id: string;
  name: string;
  kind: DomainKind;
  description?: string;
  status?: KnowledgeStatus;
}

export interface Program {
  id: string;
  name: string;
  kind: ProgramKind;
  domainIds: string[];
  level?: string;
  description?: string;
  status?: KnowledgeStatus;
}

export interface Concept {
  id: string;
  domainId: string;
  name: string;
  description?: string;
  gradeBand?: string;
  tags?: string[];
  status?: KnowledgeStatus;
}

export interface Skill {
  id: string;
  domainId: string;
  name: string;
  conceptIds: string[];
  description?: string;
  tags?: string[];
  status?: KnowledgeStatus;
}

export interface LearningObjective {
  id: string;
  domainId: string;
  name: string;
  programIds: string[];
  conceptIds: string[];
  skillIds: string[];
  description?: string;
  status?: KnowledgeStatus;
}

export type MisconceptionKind =
  | "conceptual"
  | "procedural"
  | "calculation"
  | "reading"
  | "vocabulary"
  | "grammar"
  | "speaking"
  | "time_management"
  | "strategy"
  | "other";

export interface Misconception {
  id: string;
  domainId: string;
  name: string;
  kind: MisconceptionKind;
  conceptIds: string[];
  skillIds: string[];
  remediationObjectiveIds?: string[];
  description?: string;
  status?: KnowledgeStatus;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  type: KnowledgeEdgeType;
  weight?: number;
  description?: string;
}

export interface KnowledgeLessonTemplate {
  id: string;
  domainId: string;
  title: string;
  conceptIds: string[];
  skillIds: string[];
  prerequisiteIds: string[];
  remediationObjectiveIds: string[];
  stageIds: string[];
  estimatedMinutes?: number;
  masteryTarget?: number;
  tags?: string[];
  status?: KnowledgeStatus;
}

export interface ProgramMap {
  programId: string;
  domainIds: string[];
  conceptIds: string[];
  skillIds: string[];
  objectiveIds: string[];
  entryObjectiveIds?: string[];
  exitObjectiveIds?: string[];
}

export interface KnowledgeGraph {
  schemaVersion: typeof KNOWLEDGE_GRAPH_SCHEMA_VERSION;
  domains: Domain[];
  programs: Program[];
  concepts: Concept[];
  skills: Skill[];
  objectives: LearningObjective[];
  misconceptions: Misconception[];
  lessonTemplates: KnowledgeLessonTemplate[];
  edges: KnowledgeEdge[];
  programMaps: ProgramMap[];
  generatedAt?: string;
}

export interface KnowledgeIssue {
  code: string;
  path: string;
  message: string;
}

export interface KnowledgeValidationResult {
  ok: boolean;
  errors: KnowledgeIssue[];
  warnings: KnowledgeIssue[];
}

export interface KnowledgeIndex {
  domains: Map<string, Domain>;
  programs: Map<string, Program>;
  concepts: Map<string, Concept>;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
  misconceptions: Map<string, Misconception>;
  lessonTemplates: Map<string, KnowledgeLessonTemplate>;
  edgesByFrom: Map<string, KnowledgeEdge[]>;
  edgesByTo: Map<string, KnowledgeEdge[]>;
}

export type GraphBackendEvaluationStatus = "pass" | "watch" | "blocked";

export type GraphBackendRecommendation =
  | "keep_indexed_package_graph"
  | "evaluate_relational_or_cached_traversal"
  | "evaluate_graph_db_with_rollback_plan"
  | "fix_graph_validation_before_backend_decision";

export interface GraphBackendEvaluationOptions {
  generatedAt?: string;
  benchmarkNodeIds?: string[];
  slowQueryThresholdMs?: number;
  staticNodeLimit?: number;
  staticEdgeLimit?: number;
  multiHopDepthThreshold?: number;
  crossDomainProgramThreshold?: number;
  adminDeepMultiHopRequired?: boolean;
  runtimeTraversalRequired?: boolean;
  observedQueryP95Ms?: number;
}

export interface GraphBackendEvaluationTrigger {
  id: string;
  met: boolean;
  evidence: string;
  recommendation: string;
}

export interface GraphBackendEvaluationReport {
  schemaVersion: "graph_backend_evaluation_v1";
  generatedAt: string;
  status: GraphBackendEvaluationStatus;
  recommendation: GraphBackendRecommendation;
  graphDbCriteriaMet: number;
  graphDbEvaluationEligible: boolean;
  migrationAllowed: boolean;
  rollbackPlanRequired: boolean;
  clientDirectDbAccessAllowed: boolean;
  validation: {
    ok: boolean;
    errors: number;
    warnings: number;
  };
  stats: {
    nodes: number;
    domains: number;
    programs: number;
    concepts: number;
    skills: number;
    objectives: number;
    misconceptions: number;
    lessonTemplates: number;
    edges: number;
    crossDomainPrograms: number;
  };
  benchmark: {
    queries: number;
    elapsedMs: number;
    maxQueryMs: number;
    averageQueryMs: number;
    maxClosureSize: number;
    averageClosureSize: number;
    maxPrerequisiteDepth: number;
  };
  triggers: GraphBackendEvaluationTrigger[];
  detail: string;
}

type EntityWithId = { id: string };

export function createEmptyKnowledgeGraph(): KnowledgeGraph {
  return {
    schemaVersion: KNOWLEDGE_GRAPH_SCHEMA_VERSION,
    domains: [],
    programs: [],
    concepts: [],
    skills: [],
    objectives: [],
    misconceptions: [],
    lessonTemplates: [],
    edges: [],
    programMaps: [],
    generatedAt: new Date().toISOString(),
  };
}

export function buildKnowledgeIndex(graph: KnowledgeGraph): KnowledgeIndex {
  const index: KnowledgeIndex = {
    domains: mapById(graph.domains),
    programs: mapById(graph.programs),
    concepts: mapById(graph.concepts),
    skills: mapById(graph.skills),
    objectives: mapById(graph.objectives),
    misconceptions: mapById(graph.misconceptions),
    lessonTemplates: mapById(graph.lessonTemplates || []),
    edgesByFrom: new Map<string, KnowledgeEdge[]>(),
    edgesByTo: new Map<string, KnowledgeEdge[]>(),
  };

  for (const edge of graph.edges) {
    appendToMap(index.edgesByFrom, edge.from, edge);
    appendToMap(index.edgesByTo, edge.to, edge);
  }

  return index;
}

export function validateKnowledgeGraph(graph: KnowledgeGraph): KnowledgeValidationResult {
  const errors: KnowledgeIssue[] = [];
  const warnings: KnowledgeIssue[] = [];

  if (!graph || typeof graph !== "object") {
    return {
      ok: false,
      errors: [{ code: "invalid_graph", path: "$", message: "Knowledge graph must be an object." }],
      warnings: [],
    };
  }

  if (graph.schemaVersion !== KNOWLEDGE_GRAPH_SCHEMA_VERSION) {
    errors.push({
      code: "invalid_schema_version",
      path: "schemaVersion",
      message: `Expected ${KNOWLEDGE_GRAPH_SCHEMA_VERSION}.`,
    });
  }

  validateUniqueIds("domains", graph.domains, errors);
  validateUniqueIds("programs", graph.programs, errors);
  validateUniqueIds("concepts", graph.concepts, errors);
  validateUniqueIds("skills", graph.skills, errors);
  validateUniqueIds("objectives", graph.objectives, errors);
  validateUniqueIds("misconceptions", graph.misconceptions, errors);
  validateUniqueIds("lessonTemplates", graph.lessonTemplates || [], errors);
  validateUniqueIds("edges", graph.edges, errors);

  const index = buildKnowledgeIndex(graph);
  const knownNodes = new Set<string>([
    ...index.domains.keys(),
    ...index.programs.keys(),
    ...index.concepts.keys(),
    ...index.skills.keys(),
    ...index.objectives.keys(),
    ...index.misconceptions.keys(),
    ...index.lessonTemplates.keys(),
  ]);

  graph.programs.forEach((program, indexInArray) => {
    requireText(program.id, `programs[${indexInArray}].id`, errors);
    requireText(program.name, `programs[${indexInArray}].name`, errors);
    requireRefs(program.domainIds, index.domains, `programs[${indexInArray}].domainIds`, "missing_domain", errors);
  });

  graph.concepts.forEach((concept, indexInArray) => {
    requireText(concept.id, `concepts[${indexInArray}].id`, errors);
    requireText(concept.name, `concepts[${indexInArray}].name`, errors);
    requireRef(concept.domainId, index.domains, `concepts[${indexInArray}].domainId`, "missing_domain", errors);
  });

  graph.skills.forEach((skill, indexInArray) => {
    requireText(skill.id, `skills[${indexInArray}].id`, errors);
    requireText(skill.name, `skills[${indexInArray}].name`, errors);
    requireRef(skill.domainId, index.domains, `skills[${indexInArray}].domainId`, "missing_domain", errors);
    requireRefs(skill.conceptIds, index.concepts, `skills[${indexInArray}].conceptIds`, "missing_concept", errors);
  });

  graph.objectives.forEach((objective, indexInArray) => {
    requireText(objective.id, `objectives[${indexInArray}].id`, errors);
    requireText(objective.name, `objectives[${indexInArray}].name`, errors);
    requireRef(objective.domainId, index.domains, `objectives[${indexInArray}].domainId`, "missing_domain", errors);
    requireRefs(objective.programIds, index.programs, `objectives[${indexInArray}].programIds`, "missing_program", errors);
    requireRefs(objective.conceptIds, index.concepts, `objectives[${indexInArray}].conceptIds`, "missing_concept", errors);
    requireRefs(objective.skillIds, index.skills, `objectives[${indexInArray}].skillIds`, "missing_skill", errors);
  });

  graph.misconceptions.forEach((misconception, indexInArray) => {
    requireText(misconception.id, `misconceptions[${indexInArray}].id`, errors);
    requireText(misconception.name, `misconceptions[${indexInArray}].name`, errors);
    requireRef(misconception.domainId, index.domains, `misconceptions[${indexInArray}].domainId`, "missing_domain", errors);
    requireNonEmptyRefs(misconception.conceptIds, index.concepts, `misconceptions[${indexInArray}].conceptIds`, "missing_concept", errors);
    requireNonEmptyRefs(misconception.skillIds, index.skills, `misconceptions[${indexInArray}].skillIds`, "missing_skill", errors);
    requireRefs(
      misconception.remediationObjectiveIds || [],
      index.objectives,
      `misconceptions[${indexInArray}].remediationObjectiveIds`,
      "missing_objective",
      errors,
    );
  });

  (graph.lessonTemplates || []).forEach((template, indexInArray) => {
    requireText(template.id, `lessonTemplates[${indexInArray}].id`, errors);
    requireText(template.title, `lessonTemplates[${indexInArray}].title`, errors);
    requireRef(template.domainId, index.domains, `lessonTemplates[${indexInArray}].domainId`, "missing_domain", errors);
    requireNonEmptyRefs(template.conceptIds, index.concepts, `lessonTemplates[${indexInArray}].conceptIds`, "missing_concept", errors);
    requireNonEmptyRefs(template.skillIds, index.skills, `lessonTemplates[${indexInArray}].skillIds`, "missing_skill", errors);
    requireRefs(template.prerequisiteIds || [], index.concepts, `lessonTemplates[${indexInArray}].prerequisiteIds`, "missing_concept", errors);
    requireRefs(
      template.remediationObjectiveIds || [],
      index.objectives,
      `lessonTemplates[${indexInArray}].remediationObjectiveIds`,
      "missing_objective",
      errors,
    );
  });

  graph.edges.forEach((edge, indexInArray) => {
    requireText(edge.id, `edges[${indexInArray}].id`, errors);
    if (!knownNodes.has(edge.from)) {
      errors.push({ code: "missing_edge_from", path: `edges[${indexInArray}].from`, message: `Unknown source node: ${edge.from}.` });
    }
    if (!knownNodes.has(edge.to)) {
      errors.push({ code: "missing_edge_to", path: `edges[${indexInArray}].to`, message: `Unknown target node: ${edge.to}.` });
    }
    if (edge.from === edge.to) {
      errors.push({ code: "self_edge", path: `edges[${indexInArray}]`, message: "Knowledge edge cannot point to itself." });
    }
    if (edge.weight !== undefined && (edge.weight < 0 || edge.weight > 1)) {
      errors.push({ code: "invalid_weight", path: `edges[${indexInArray}].weight`, message: "Edge weight must be between 0 and 1." });
    }
  });

  graph.programMaps.forEach((programMap, indexInArray) => {
    requireRef(programMap.programId, index.programs, `programMaps[${indexInArray}].programId`, "missing_program", errors);
    requireRefs(programMap.domainIds, index.domains, `programMaps[${indexInArray}].domainIds`, "missing_domain", errors);
    requireRefs(programMap.conceptIds, index.concepts, `programMaps[${indexInArray}].conceptIds`, "missing_concept", errors);
    requireRefs(programMap.skillIds, index.skills, `programMaps[${indexInArray}].skillIds`, "missing_skill", errors);
    requireRefs(programMap.objectiveIds, index.objectives, `programMaps[${indexInArray}].objectiveIds`, "missing_objective", errors);
    requireRefs(programMap.entryObjectiveIds || [], index.objectives, `programMaps[${indexInArray}].entryObjectiveIds`, "missing_objective", errors);
    requireRefs(programMap.exitObjectiveIds || [], index.objectives, `programMaps[${indexInArray}].exitObjectiveIds`, "missing_objective", errors);
  });

  for (const program of graph.programs) {
    if (!graph.programMaps.some((programMap) => programMap.programId === program.id)) {
      warnings.push({ code: "program_without_map", path: `programs.${program.id}`, message: `Program ${program.id} has no ProgramMap.` });
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function assertValidKnowledgeGraph(graph: KnowledgeGraph): KnowledgeGraph {
  const result = validateKnowledgeGraph(graph);
  if (!result.ok) {
    throw new Error(result.errors.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
  }
  return graph;
}

export function prerequisiteClosure(graph: KnowledgeGraph, nodeId: string): string[] {
  const index = buildKnowledgeIndex(graph);
  const visited = new Set<string>();
  const stack = (index.edgesByTo.get(nodeId) || []).filter((edge) => edge.type === "prerequisite").map((edge) => edge.from);

  while (stack.length) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    stack.push(...(index.edgesByTo.get(current) || []).filter((edge) => edge.type === "prerequisite").map((edge) => edge.from));
  }

  return [...visited];
}

export function buildGraphBackendEvaluationReport(
  graph: KnowledgeGraph,
  options: GraphBackendEvaluationOptions = {},
): GraphBackendEvaluationReport {
  const validation = validateKnowledgeGraph(graph);
  const stats = buildGraphBackendStats(graph);
  const benchmark = benchmarkPrerequisiteQueries(graph, options.benchmarkNodeIds);
  const slowQueryThresholdMs = positiveNumber(options.slowQueryThresholdMs, 25);
  const staticNodeLimit = positiveNumber(options.staticNodeLimit, 25000);
  const staticEdgeLimit = positiveNumber(options.staticEdgeLimit, 75000);
  const multiHopDepthThreshold = positiveNumber(options.multiHopDepthThreshold, 8);
  const crossDomainProgramThreshold = positiveNumber(options.crossDomainProgramThreshold, 3);
  const observedOrMeasuredQueryMs = Number.isFinite(options.observedQueryP95Ms)
    ? Number(options.observedQueryP95Ms)
    : benchmark.maxQueryMs;
  const triggers: GraphBackendEvaluationTrigger[] = [
    {
      id: "indexed_query_performance_limit",
      met: observedOrMeasuredQueryMs > slowQueryThresholdMs,
      evidence: `query=${roundNumber(observedOrMeasuredQueryMs)}ms threshold=${slowQueryThresholdMs}ms`,
      recommendation: "Try cached traversal or relational/indexed storage before Graph DB.",
    },
    {
      id: "content_volume_limit",
      met: stats.nodes > staticNodeLimit || stats.edges > staticEdgeLimit,
      evidence: `nodes=${stats.nodes}/${staticNodeLimit}, edges=${stats.edges}/${staticEdgeLimit}`,
      recommendation: "Move from static package graph only after volume exceeds configured limits.",
    },
    {
      id: "cross_program_traversal_complexity",
      met: stats.crossDomainPrograms >= crossDomainProgramThreshold || benchmark.maxPrerequisiteDepth >= multiHopDepthThreshold,
      evidence: `crossDomainPrograms=${stats.crossDomainPrograms}/${crossDomainProgramThreshold}, maxDepth=${benchmark.maxPrerequisiteDepth}/${multiHopDepthThreshold}`,
      recommendation: "Prefer cached graph traversal in @miuprep/knowledge until multi-hop complexity is proven.",
    },
    {
      id: "admin_deep_multi_hop_need",
      met: Boolean(options.adminDeepMultiHopRequired),
      evidence: options.adminDeepMultiHopRequired ? "admin multi-hop review requirement supplied" : "no admin multi-hop requirement supplied",
      recommendation: "Document admin review queries before choosing a graph-native backend.",
    },
    {
      id: "runtime_graph_traversal_need",
      met: Boolean(options.runtimeTraversalRequired),
      evidence: options.runtimeTraversalRequired ? "runtime traversal requirement supplied" : "no runtime traversal requirement supplied",
      recommendation: "Keep client apps independent of database shape; expose package/service APIs only.",
    },
  ];
  const graphDbCriteriaMet = triggers.filter((trigger) => trigger.met).length;
  const graphDbEvaluationEligible = validation.ok && graphDbCriteriaMet >= 2;
  const recommendation: GraphBackendRecommendation = !validation.ok
    ? "fix_graph_validation_before_backend_decision"
    : graphDbCriteriaMet >= 2
      ? "evaluate_graph_db_with_rollback_plan"
      : graphDbCriteriaMet === 1
        ? "evaluate_relational_or_cached_traversal"
        : "keep_indexed_package_graph";
  const status: GraphBackendEvaluationStatus = !validation.ok
    ? "blocked"
    : graphDbCriteriaMet >= 2
      ? "watch"
      : "pass";

  return {
    schemaVersion: "graph_backend_evaluation_v1",
    generatedAt: options.generatedAt || new Date().toISOString(),
    status,
    recommendation,
    graphDbCriteriaMet,
    graphDbEvaluationEligible,
    migrationAllowed: false,
    rollbackPlanRequired: graphDbEvaluationEligible,
    clientDirectDbAccessAllowed: false,
    validation: {
      ok: validation.ok,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
    },
    stats,
    benchmark,
    triggers,
    detail: !validation.ok
      ? "Knowledge Graph validation must be fixed before any backend evaluation."
      : graphDbEvaluationEligible
        ? "At least two Graph DB evaluation criteria are met; evaluate with a rollback plan, but do not migrate automatically."
        : "Current indexed package graph is sufficient for this graph size and measured traversal workload.",
  };
}

export function createSeedKnowledgeGraph(): KnowledgeGraph {
  const graph: KnowledgeGraph = {
    schemaVersion: KNOWLEDGE_GRAPH_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    domains: [
      { id: "mathematics", name: "Mathematics", kind: "mathematics", status: "active" },
      { id: "english_core", name: "English Core", kind: "english_core", status: "active" },
    ],
    programs: [
      { id: "vn_math_6_8", name: "VN Math 6-8", kind: "curriculum", domainIds: ["mathematics"], level: "lower_secondary_foundation", status: "active" },
      { id: "vn_math_6_9", name: "VN Math 6-9", kind: "curriculum", domainIds: ["mathematics"], level: "lower_secondary", status: "active" },
      { id: "vn_math_10_12", name: "VN Math 10-12", kind: "curriculum", domainIds: ["mathematics"], level: "upper_secondary", status: "active" },
      { id: "ielts", name: "IELTS", kind: "exam", domainIds: ["english_core"], level: "B1-C1", status: "active" },
      { id: "sat", name: "SAT", kind: "exam", domainIds: ["mathematics", "english_core"], level: "secondary", status: "draft" },
      { id: "cae", name: "CAE", kind: "certification", domainIds: ["english_core"], level: "C1", status: "draft" },
      { id: "cpe", name: "CPE", kind: "certification", domainIds: ["english_core"], level: "C2", status: "active" },
    ],
    concepts: [
      { id: "math.integer_number", domainId: "mathematics", name: "Integer and Rational Number", gradeBand: "6-7", status: "active" },
      { id: "math.fraction_decimal", domainId: "mathematics", name: "Fraction and Decimal", gradeBand: "6-7", status: "active" },
      { id: "math.ratio_proportion", domainId: "mathematics", name: "Ratio and Proportion", gradeBand: "6-8", status: "active" },
      { id: "math.basic_geometry", domainId: "mathematics", name: "Basic Geometry", gradeBand: "6-8", status: "active" },
      { id: "math.linear_expression", domainId: "mathematics", name: "Linear Expression", gradeBand: "7-8", status: "active" },
      { id: "math.inequality", domainId: "mathematics", name: "Inequality", gradeBand: "7-8", status: "active" },
      { id: "math.polynomial", domainId: "mathematics", name: "Polynomial", gradeBand: "8", status: "active" },
      { id: "math.algebraic_expression", domainId: "mathematics", name: "Algebraic Expression", gradeBand: "8-9", status: "active" },
      { id: "math.factorization", domainId: "mathematics", name: "Factorization", gradeBand: "8-9", status: "active" },
      { id: "math.linear_equation", domainId: "mathematics", name: "Linear Equation", gradeBand: "7-9", status: "active" },
      { id: "math.quadratic_equation", domainId: "mathematics", name: "Quadratic Equation", gradeBand: "9", status: "active" },
      { id: "math.vieta", domainId: "mathematics", name: "Vieta Theorem", gradeBand: "9", status: "active" },
      { id: "math.functions_graphs", domainId: "mathematics", name: "Functions and Graphs", gradeBand: "9-10", status: "active" },
      { id: "math.word_problem_modeling", domainId: "mathematics", name: "Word Problem Modeling", gradeBand: "8-9", status: "active" },
      { id: "math.plane_geometry", domainId: "mathematics", name: "Plane Geometry", gradeBand: "8-9", status: "active" },
      { id: "math.geometry_proof", domainId: "mathematics", name: "Geometry Proof", gradeBand: "8-10", status: "active" },
      { id: "math.trigonometry", domainId: "mathematics", name: "Trigonometry", gradeBand: "9", status: "active" },
      { id: "math.spatial_geometry", domainId: "mathematics", name: "Spatial Geometry", gradeBand: "9", status: "active" },
      { id: "math.statistics", domainId: "mathematics", name: "Statistics", gradeBand: "7-9", status: "active" },
      { id: "math.probability", domainId: "mathematics", name: "Probability", gradeBand: "8-9", status: "active" },
      { id: "math.calculator_strategy", domainId: "mathematics", name: "Calculator Strategy", gradeBand: "9-12", status: "active" },
      { id: "math.advanced_function", domainId: "mathematics", name: "Advanced Functions", gradeBand: "10-12", status: "active" },
      { id: "math.vector_coordinate_geometry", domainId: "mathematics", name: "Vector and Coordinate Geometry", gradeBand: "10-12", status: "active" },
      { id: "math.sequence_series", domainId: "mathematics", name: "Sequences and Series", gradeBand: "11-12", status: "active" },
      { id: "math.exponential_logarithm", domainId: "mathematics", name: "Exponential and Logarithmic Functions", gradeBand: "11-12", status: "active" },
      { id: "math.calculus_foundation", domainId: "mathematics", name: "Calculus Foundation", gradeBand: "11-12", status: "active" },
      { id: "math.solid_geometry_advanced", domainId: "mathematics", name: "Advanced Solid Geometry", gradeBand: "11-12", status: "active" },
      { id: "math.combinatorics_probability", domainId: "mathematics", name: "Combinatorics and Probability", gradeBand: "10-12", status: "active" },
      { id: "math.statistics_advanced", domainId: "mathematics", name: "Advanced Statistics", gradeBand: "10-12", status: "draft" },
      { id: "math.untagged", domainId: "mathematics", name: "Untagged Mathematics", gradeBand: "6-12", status: "draft" },
      { id: "eng.vocabulary_range", domainId: "english_core", name: "Vocabulary Range", status: "active" },
      { id: "eng.word_formation", domainId: "english_core", name: "Word Formation", status: "active" },
      { id: "eng.collocation_phraseology", domainId: "english_core", name: "Collocation and Phraseology", status: "active" },
      { id: "eng.academic_register", domainId: "english_core", name: "Academic Register", status: "active" },
      { id: "eng.grammar_accuracy", domainId: "english_core", name: "Grammar Accuracy", status: "active" },
      { id: "eng.sentence_structure", domainId: "english_core", name: "Sentence Structure", status: "active" },
      { id: "eng.verb_tense_aspect", domainId: "english_core", name: "Verb Tense and Aspect", status: "active" },
      { id: "eng.cohesion_reference", domainId: "english_core", name: "Cohesion and Reference", status: "active" },
      { id: "eng.reading_main_idea", domainId: "english_core", name: "Reading Main Idea", status: "active" },
      { id: "eng.reading_detail", domainId: "english_core", name: "Reading Detail", status: "active" },
      { id: "eng.reading_inference", domainId: "english_core", name: "Reading Inference", status: "active" },
      { id: "eng.reading_argument_structure", domainId: "english_core", name: "Reading Argument Structure", status: "active" },
      { id: "eng.listening_main_idea", domainId: "english_core", name: "Listening Main Idea", status: "active" },
      { id: "eng.listening_detail", domainId: "english_core", name: "Listening Detail", status: "draft" },
      { id: "eng.listening_inference", domainId: "english_core", name: "Listening Inference", status: "draft" },
      { id: "eng.listening_attitude", domainId: "english_core", name: "Listening Speaker Attitude", status: "draft" },
      { id: "eng.academic_writing", domainId: "english_core", name: "Academic Writing", status: "draft" },
      { id: "eng.writing_task_response", domainId: "english_core", name: "Writing Task Response", status: "draft" },
      { id: "eng.paragraph_development", domainId: "english_core", name: "Paragraph Development", status: "draft" },
      { id: "eng.essay_coherence", domainId: "english_core", name: "Essay Coherence", status: "draft" },
      { id: "eng.speaking_fluency", domainId: "english_core", name: "Speaking Fluency", status: "draft" },
      { id: "eng.pronunciation_control", domainId: "english_core", name: "Pronunciation Control", status: "draft" },
      { id: "eng.interactive_communication", domainId: "english_core", name: "Interactive Communication", status: "draft" },
      { id: "eng.spoken_discourse_management", domainId: "english_core", name: "Spoken Discourse Management", status: "draft" },
    ],
    skills: [
      { id: "math.operate_rational_numbers", domainId: "mathematics", name: "Operate with rational numbers", conceptIds: ["math.integer_number", "math.fraction_decimal"], status: "active" },
      { id: "math.convert_fraction_decimal", domainId: "mathematics", name: "Convert fractions and decimals", conceptIds: ["math.fraction_decimal"], status: "active" },
      { id: "math.solve_ratio_problem", domainId: "mathematics", name: "Solve ratio and proportion problems", conceptIds: ["math.ratio_proportion", "math.word_problem_modeling"], status: "active" },
      { id: "math.reason_basic_geometry", domainId: "mathematics", name: "Reason with basic geometry", conceptIds: ["math.basic_geometry"], status: "active" },
      { id: "math.manipulate_linear_expression", domainId: "mathematics", name: "Manipulate linear expressions", conceptIds: ["math.linear_expression", "math.algebraic_expression"], status: "active" },
      { id: "math.solve_inequality", domainId: "mathematics", name: "Solve inequalities", conceptIds: ["math.inequality", "math.linear_expression"], status: "active" },
      { id: "math.factor_polynomial", domainId: "mathematics", name: "Factor polynomials", conceptIds: ["math.polynomial", "math.factorization"], status: "active" },
      { id: "math.simplify_expression", domainId: "mathematics", name: "Simplify algebraic expressions", conceptIds: ["math.algebraic_expression", "math.factorization"], status: "active" },
      { id: "math.optimize_expression", domainId: "mathematics", name: "Optimize algebraic expressions", conceptIds: ["math.algebraic_expression"], status: "active" },
      { id: "math.factor_common_terms", domainId: "mathematics", name: "Factor common terms", conceptIds: ["math.factorization"], status: "active" },
      { id: "math.solve_linear_equation", domainId: "mathematics", name: "Solve linear equations", conceptIds: ["math.linear_equation"], status: "active" },
      { id: "math.solve_system", domainId: "mathematics", name: "Solve systems of equations", conceptIds: ["math.linear_equation"], status: "active" },
      { id: "math.solve_quadratic_by_factor", domainId: "mathematics", name: "Solve quadratic equations by factoring", conceptIds: ["math.quadratic_equation", "math.factorization"], status: "active" },
      { id: "math.apply_vieta", domainId: "mathematics", name: "Apply Vieta theorem", conceptIds: ["math.vieta", "math.quadratic_equation"], status: "active" },
      { id: "math.analyze_function_graph", domainId: "mathematics", name: "Analyze function graphs", conceptIds: ["math.functions_graphs", "math.quadratic_equation"], status: "active" },
      { id: "math.model_word_problem", domainId: "mathematics", name: "Model word problems with equations", conceptIds: ["math.word_problem_modeling", "math.linear_equation"], status: "active" },
      { id: "math.prove_circle_geometry", domainId: "mathematics", name: "Prove circle geometry relations", conceptIds: ["math.plane_geometry", "math.geometry_proof"], status: "active" },
      { id: "math.geometry_reasoning", domainId: "mathematics", name: "Use valid proof reasoning", conceptIds: ["math.geometry_proof"], status: "active" },
      { id: "math.use_trig_ratios", domainId: "mathematics", name: "Use trigonometric ratios", conceptIds: ["math.trigonometry"], status: "active" },
      { id: "math.compute_solid_measure", domainId: "mathematics", name: "Compute solid geometry measures", conceptIds: ["math.spatial_geometry"], status: "active" },
      { id: "math.interpret_statistics", domainId: "mathematics", name: "Interpret statistics and charts", conceptIds: ["math.statistics"], status: "active" },
      { id: "math.compute_probability", domainId: "mathematics", name: "Compute probability", conceptIds: ["math.probability"], status: "active" },
      { id: "math.use_calculator_strategy", domainId: "mathematics", name: "Use calculator strategies", conceptIds: ["math.calculator_strategy"], status: "active" },
      { id: "math.analyze_advanced_function", domainId: "mathematics", name: "Analyze advanced functions", conceptIds: ["math.advanced_function", "math.functions_graphs"], status: "active" },
      { id: "math.solve_vector_coordinate_problem", domainId: "mathematics", name: "Solve vector and coordinate problems", conceptIds: ["math.vector_coordinate_geometry", "math.trigonometry"], status: "active" },
      { id: "math.work_with_sequence_series", domainId: "mathematics", name: "Work with sequences and series", conceptIds: ["math.sequence_series", "math.advanced_function"], status: "active" },
      { id: "math.solve_exponential_logarithm", domainId: "mathematics", name: "Solve exponential and logarithmic problems", conceptIds: ["math.exponential_logarithm", "math.advanced_function"], status: "active" },
      { id: "math.differentiate_basic_function", domainId: "mathematics", name: "Differentiate basic functions", conceptIds: ["math.calculus_foundation", "math.advanced_function"], status: "active" },
      { id: "math.reason_advanced_solid_geometry", domainId: "mathematics", name: "Reason in advanced solid geometry", conceptIds: ["math.solid_geometry_advanced", "math.spatial_geometry"], status: "active" },
      { id: "math.count_combinatoric_cases", domainId: "mathematics", name: "Count combinatoric cases", conceptIds: ["math.combinatorics_probability", "math.probability"], status: "active" },
      { id: "math.analyze_advanced_statistics", domainId: "mathematics", name: "Analyze advanced statistics", conceptIds: ["math.statistics_advanced", "math.statistics"], status: "draft" },
      { id: "math.untagged", domainId: "mathematics", name: "Untagged mathematics skill", conceptIds: ["math.untagged"], status: "draft" },
      { id: "eng.use_collocation", domainId: "english_core", name: "Use collocations accurately", conceptIds: ["eng.collocation_phraseology", "eng.vocabulary_range"], status: "active" },
      { id: "eng.build_word_family", domainId: "english_core", name: "Build word families", conceptIds: ["eng.word_formation", "eng.vocabulary_range"], status: "active" },
      { id: "eng.choose_register", domainId: "english_core", name: "Choose appropriate register", conceptIds: ["eng.academic_register", "eng.vocabulary_range"], status: "active" },
      { id: "eng.control_clause_structure", domainId: "english_core", name: "Control clause structure", conceptIds: ["eng.grammar_accuracy"], status: "active" },
      { id: "eng.control_tense_aspect", domainId: "english_core", name: "Control tense and aspect", conceptIds: ["eng.verb_tense_aspect", "eng.grammar_accuracy"], status: "active" },
      { id: "eng.edit_sentence_errors", domainId: "english_core", name: "Edit sentence-level errors", conceptIds: ["eng.sentence_structure", "eng.grammar_accuracy"], status: "active" },
      { id: "eng.track_cohesive_reference", domainId: "english_core", name: "Track cohesive reference", conceptIds: ["eng.cohesion_reference", "eng.reading_argument_structure"], status: "active" },
      { id: "eng.identify_main_idea", domainId: "english_core", name: "Identify main idea", conceptIds: ["eng.reading_main_idea"], status: "active" },
      { id: "eng.infer_implicit_meaning", domainId: "english_core", name: "Infer implicit meaning", conceptIds: ["eng.reading_inference"], status: "active" },
      { id: "eng.identify_specific_detail", domainId: "english_core", name: "Identify specific detail", conceptIds: ["eng.reading_detail", "eng.listening_detail"], status: "active" },
      { id: "eng.evaluate_argument_flow", domainId: "english_core", name: "Evaluate argument flow", conceptIds: ["eng.reading_argument_structure", "eng.reading_inference"], status: "active" },
      { id: "eng.identify_listening_main_idea", domainId: "english_core", name: "Identify listening main idea", conceptIds: ["eng.listening_main_idea"], status: "active" },
      { id: "eng.infer_speaker_attitude", domainId: "english_core", name: "Infer speaker attitude", conceptIds: ["eng.listening_attitude", "eng.listening_inference"], status: "draft" },
      { id: "eng.develop_academic_argument", domainId: "english_core", name: "Develop academic argument", conceptIds: ["eng.academic_writing"], status: "draft" },
      { id: "eng.plan_essay_response", domainId: "english_core", name: "Plan essay response", conceptIds: ["eng.writing_task_response", "eng.academic_writing"], status: "draft" },
      { id: "eng.develop_body_paragraph", domainId: "english_core", name: "Develop body paragraphs", conceptIds: ["eng.paragraph_development", "eng.academic_writing"], status: "draft" },
      { id: "eng.revise_for_coherence", domainId: "english_core", name: "Revise for coherence", conceptIds: ["eng.essay_coherence", "eng.cohesion_reference"], status: "draft" },
      { id: "eng.write_overview_summary", domainId: "english_core", name: "Write overview and summary", conceptIds: ["eng.writing_task_response", "eng.academic_writing"], status: "draft" },
      { id: "eng.organize_spoken_response", domainId: "english_core", name: "Organize spoken response", conceptIds: ["eng.spoken_discourse_management", "eng.speaking_fluency"], status: "draft" },
      { id: "eng.sustain_fluent_turn", domainId: "english_core", name: "Sustain a fluent speaking turn", conceptIds: ["eng.speaking_fluency"], status: "draft" },
      { id: "eng.manage_interactive_communication", domainId: "english_core", name: "Manage interactive communication", conceptIds: ["eng.interactive_communication", "eng.speaking_fluency"], status: "draft" },
      { id: "eng.use_pronunciation_features", domainId: "english_core", name: "Use pronunciation features", conceptIds: ["eng.pronunciation_control"], status: "draft" },
    ],
    objectives: [
      {
        id: "obj.math.grade6_8.number_foundation",
        domainId: "mathematics",
        name: "Grade 6-8 number foundation",
        programIds: ["vn_math_6_8", "vn_math_6_9"],
        conceptIds: ["math.integer_number", "math.fraction_decimal", "math.ratio_proportion"],
        skillIds: ["math.operate_rational_numbers", "math.convert_fraction_decimal", "math.solve_ratio_problem"],
        status: "active",
      },
      {
        id: "obj.math.grade6_8.algebra_foundation",
        domainId: "mathematics",
        name: "Grade 6-8 algebra foundation",
        programIds: ["vn_math_6_8", "vn_math_6_9"],
        conceptIds: ["math.linear_expression", "math.inequality", "math.polynomial", "math.algebraic_expression"],
        skillIds: ["math.manipulate_linear_expression", "math.solve_inequality", "math.factor_polynomial", "math.simplify_expression"],
        status: "active",
      },
      {
        id: "obj.math.grade6_8.geometry_foundation",
        domainId: "mathematics",
        name: "Grade 6-8 geometry foundation",
        programIds: ["vn_math_6_8", "vn_math_6_9"],
        conceptIds: ["math.basic_geometry", "math.plane_geometry", "math.statistics", "math.probability"],
        skillIds: ["math.reason_basic_geometry", "math.interpret_statistics", "math.compute_probability"],
        status: "active",
      },
      {
        id: "obj.math.grade9.quadratic_foundation",
        domainId: "mathematics",
        name: "Grade 9 quadratic foundation",
        programIds: ["vn_math_6_9"],
        conceptIds: ["math.factorization", "math.quadratic_equation"],
        skillIds: ["math.factor_common_terms", "math.solve_quadratic_by_factor"],
        status: "active",
      },
      {
        id: "obj.math.grade9.miumath_pilot",
        domainId: "mathematics",
        name: "MiuMath grade 9 pilot coverage",
        programIds: ["vn_math_6_9"],
        conceptIds: [
          "math.algebraic_expression",
          "math.factorization",
          "math.linear_equation",
          "math.quadratic_equation",
          "math.vieta",
          "math.functions_graphs",
          "math.word_problem_modeling",
          "math.plane_geometry",
          "math.geometry_proof",
          "math.trigonometry",
          "math.spatial_geometry",
          "math.statistics",
          "math.probability",
          "math.calculator_strategy",
        ],
        skillIds: [
          "math.simplify_expression",
          "math.factor_common_terms",
          "math.solve_linear_equation",
          "math.solve_system",
          "math.solve_quadratic_by_factor",
          "math.apply_vieta",
          "math.analyze_function_graph",
          "math.model_word_problem",
          "math.prove_circle_geometry",
          "math.geometry_reasoning",
          "math.use_trig_ratios",
          "math.compute_solid_measure",
          "math.interpret_statistics",
          "math.compute_probability",
          "math.use_calculator_strategy",
        ],
        status: "active",
      },
      {
        id: "obj.math.grade10.function_vector_foundation",
        domainId: "mathematics",
        name: "Grade 10 function and vector foundation",
        programIds: ["vn_math_10_12"],
        conceptIds: ["math.functions_graphs", "math.advanced_function", "math.vector_coordinate_geometry", "math.trigonometry"],
        skillIds: ["math.analyze_function_graph", "math.analyze_advanced_function", "math.solve_vector_coordinate_problem", "math.use_trig_ratios"],
        status: "active",
      },
      {
        id: "obj.math.grade11.algebra_calculus_foundation",
        domainId: "mathematics",
        name: "Grade 11 algebra and calculus foundation",
        programIds: ["vn_math_10_12"],
        conceptIds: ["math.sequence_series", "math.exponential_logarithm", "math.calculus_foundation", "math.advanced_function"],
        skillIds: ["math.work_with_sequence_series", "math.solve_exponential_logarithm", "math.differentiate_basic_function", "math.analyze_advanced_function"],
        status: "active",
      },
      {
        id: "obj.math.grade12.geometry_probability_foundation",
        domainId: "mathematics",
        name: "Grade 12 geometry and probability foundation",
        programIds: ["vn_math_10_12"],
        conceptIds: ["math.solid_geometry_advanced", "math.combinatorics_probability", "math.statistics_advanced", "math.probability"],
        skillIds: ["math.reason_advanced_solid_geometry", "math.count_combinatoric_cases", "math.analyze_advanced_statistics", "math.compute_probability"],
        status: "active",
      },
      {
        id: "obj.ielts.reading_inference",
        domainId: "english_core",
        name: "IELTS reading inference",
        programIds: ["ielts"],
        conceptIds: ["eng.reading_inference", "eng.reading_detail", "eng.vocabulary_range"],
        skillIds: ["eng.infer_implicit_meaning", "eng.identify_specific_detail", "eng.use_collocation"],
        status: "active",
      },
      {
        id: "obj.ielts.reading_listening_beta",
        domainId: "english_core",
        name: "IELTS Reading/Listening beta foundation",
        programIds: ["ielts"],
        conceptIds: ["eng.reading_inference", "eng.vocabulary_range", "eng.grammar_accuracy", "eng.listening_detail"],
        skillIds: ["eng.infer_implicit_meaning", "eng.use_collocation", "eng.control_clause_structure", "eng.identify_specific_detail"],
        description: "Focused target set for the first IELTS Reading/Listening adaptive beta, based on learning-ready content currently available.",
        status: "active",
      },
      {
        id: "obj.english.vocabulary_core",
        domainId: "english_core",
        name: "English vocabulary core",
        programIds: ["ielts", "cae", "cpe", "sat"],
        conceptIds: ["eng.vocabulary_range", "eng.word_formation", "eng.collocation_phraseology", "eng.academic_register"],
        skillIds: ["eng.use_collocation", "eng.build_word_family", "eng.choose_register"],
        status: "active",
      },
      {
        id: "obj.english.reading_core",
        domainId: "english_core",
        name: "English reading core",
        programIds: ["ielts", "cae", "cpe", "sat"],
        conceptIds: ["eng.reading_main_idea", "eng.reading_detail", "eng.reading_inference", "eng.reading_argument_structure"],
        skillIds: ["eng.identify_main_idea", "eng.identify_specific_detail", "eng.infer_implicit_meaning", "eng.evaluate_argument_flow", "eng.track_cohesive_reference"],
        status: "active",
      },
      {
        id: "obj.english.listening_core",
        domainId: "english_core",
        name: "English listening core",
        programIds: ["ielts", "cae", "cpe"],
        conceptIds: ["eng.listening_main_idea", "eng.listening_detail", "eng.listening_inference", "eng.listening_attitude"],
        skillIds: ["eng.identify_listening_main_idea", "eng.identify_specific_detail", "eng.infer_speaker_attitude"],
        status: "active",
      },
      {
        id: "obj.english.grammar_core",
        domainId: "english_core",
        name: "English grammar core",
        programIds: ["ielts", "cae", "cpe", "sat"],
        conceptIds: ["eng.grammar_accuracy", "eng.sentence_structure", "eng.verb_tense_aspect", "eng.cohesion_reference"],
        skillIds: ["eng.control_clause_structure", "eng.control_tense_aspect", "eng.edit_sentence_errors", "eng.track_cohesive_reference"],
        status: "active",
      },
      {
        id: "obj.english.writing_core",
        domainId: "english_core",
        name: "English writing core",
        programIds: ["ielts", "cae", "cpe"],
        conceptIds: ["eng.academic_writing", "eng.writing_task_response", "eng.paragraph_development", "eng.essay_coherence"],
        skillIds: ["eng.develop_academic_argument", "eng.plan_essay_response", "eng.develop_body_paragraph", "eng.revise_for_coherence", "eng.write_overview_summary"],
        status: "draft",
      },
      {
        id: "obj.english.speaking_core",
        domainId: "english_core",
        name: "English speaking core",
        programIds: ["ielts", "cae", "cpe"],
        conceptIds: ["eng.speaking_fluency", "eng.pronunciation_control", "eng.interactive_communication", "eng.spoken_discourse_management"],
        skillIds: ["eng.organize_spoken_response", "eng.sustain_fluent_turn", "eng.manage_interactive_communication", "eng.use_pronunciation_features"],
        status: "draft",
      },
      {
        id: "obj.sat.math_core",
        domainId: "mathematics",
        name: "SAT math core",
        programIds: ["sat"],
        conceptIds: ["math.linear_equation", "math.quadratic_equation", "math.functions_graphs", "math.word_problem_modeling", "math.statistics"],
        skillIds: ["math.solve_linear_equation", "math.solve_quadratic_by_factor", "math.analyze_function_graph", "math.model_word_problem", "math.interpret_statistics"],
        status: "draft",
      },
      {
        id: "obj.sat.rw_core",
        domainId: "english_core",
        name: "SAT reading and writing core",
        programIds: ["sat"],
        conceptIds: ["eng.grammar_accuracy", "eng.sentence_structure", "eng.reading_main_idea", "eng.reading_detail", "eng.reading_inference", "eng.reading_argument_structure"],
        skillIds: ["eng.control_clause_structure", "eng.edit_sentence_errors", "eng.identify_main_idea", "eng.identify_specific_detail", "eng.infer_implicit_meaning", "eng.evaluate_argument_flow"],
        status: "draft",
      },
    ],
    misconceptions: [
      {
        id: "mis.math.factor_vs_expand",
        domainId: "mathematics",
        name: "Confuses factoring with expanding",
        kind: "procedural",
        conceptIds: ["math.factorization"],
        skillIds: ["math.factor_common_terms", "math.solve_quadratic_by_factor"],
        remediationObjectiveIds: ["obj.math.grade9.quadratic_foundation"],
        status: "active",
      },
      {
        id: "mis.math.missing_domain_condition",
        domainId: "mathematics",
        name: "Ignores variable domain or validity conditions",
        kind: "procedural",
        conceptIds: ["math.algebraic_expression", "math.functions_graphs"],
        skillIds: ["math.simplify_expression", "math.analyze_function_graph"],
        remediationObjectiveIds: ["obj.math.grade9.miumath_pilot"],
        status: "active",
      },
      {
        id: "mis.math.calculation_slip",
        domainId: "mathematics",
        name: "Makes arithmetic slip after choosing the right method",
        kind: "calculation",
        conceptIds: ["math.integer_number", "math.fraction_decimal"],
        skillIds: ["math.operate_rational_numbers", "math.convert_fraction_decimal"],
        remediationObjectiveIds: ["obj.math.grade6_8.number_foundation"],
        status: "active",
      },
      {
        id: "mis.math.reading_prompt_to_equation",
        domainId: "mathematics",
        name: "Misreads word problem into the wrong equation",
        kind: "reading",
        conceptIds: ["math.word_problem_modeling"],
        skillIds: ["math.model_word_problem"],
        remediationObjectiveIds: ["obj.math.grade9.miumath_pilot"],
        status: "active",
      },
      {
        id: "mis.math.function_parameter_confusion",
        domainId: "mathematics",
        name: "Confuses function parameters with graph behavior",
        kind: "conceptual",
        conceptIds: ["math.advanced_function", "math.functions_graphs"],
        skillIds: ["math.analyze_advanced_function", "math.analyze_function_graph"],
        remediationObjectiveIds: ["obj.math.grade10.function_vector_foundation"],
        status: "active",
      },
      {
        id: "mis.math.log_domain_condition",
        domainId: "mathematics",
        name: "Ignores logarithm domain conditions",
        kind: "procedural",
        conceptIds: ["math.exponential_logarithm", "math.advanced_function"],
        skillIds: ["math.solve_exponential_logarithm", "math.analyze_advanced_function"],
        remediationObjectiveIds: ["obj.math.grade11.algebra_calculus_foundation"],
        status: "active",
      },
      {
        id: "mis.math.combinatorics_overcount",
        domainId: "mathematics",
        name: "Overcounts or undercounts combinatoric cases",
        kind: "conceptual",
        conceptIds: ["math.combinatorics_probability", "math.probability"],
        skillIds: ["math.count_combinatoric_cases", "math.compute_probability"],
        remediationObjectiveIds: ["obj.math.grade12.geometry_probability_foundation"],
        status: "active",
      },
      {
        id: "mis.math.casio_operation_error",
        domainId: "mathematics",
        name: "Overtrusts calculator or enters expressions without mathematical setup",
        kind: "calculation",
        conceptIds: ["math.calculator_strategy", "math.quadratic_equation", "math.functions_graphs"],
        skillIds: ["math.use_calculator_strategy", "math.solve_quadratic_by_factor", "math.analyze_function_graph"],
        remediationObjectiveIds: ["obj.math.grade9.miumath_pilot", "obj.math.grade10.function_vector_foundation"],
        status: "active",
      },
      {
        id: "mis.math.geometry_proof_gap",
        domainId: "mathematics",
        name: "Writes geometry proof without given-target-theorem-plan scaffold",
        kind: "conceptual",
        conceptIds: ["math.geometry_proof", "math.plane_geometry"],
        skillIds: ["math.geometry_reasoning", "math.prove_circle_geometry"],
        remediationObjectiveIds: ["obj.math.grade9.miumath_pilot"],
        status: "active",
      },
      {
        id: "mis.eng.inference_literal_only",
        domainId: "english_core",
        name: "Answers inference questions literally",
        kind: "reading",
        conceptIds: ["eng.reading_inference"],
        skillIds: ["eng.infer_implicit_meaning"],
        remediationObjectiveIds: ["obj.english.reading_core", "obj.ielts.reading_inference", "obj.ielts.reading_listening_beta"],
        status: "active",
      },
      {
        id: "mis.eng.word_family_guessing",
        domainId: "english_core",
        name: "Guesses word form without checking grammar role",
        kind: "vocabulary",
        conceptIds: ["eng.word_formation", "eng.grammar_accuracy"],
        skillIds: ["eng.build_word_family", "eng.edit_sentence_errors"],
        remediationObjectiveIds: ["obj.english.vocabulary_core", "obj.english.grammar_core"],
        status: "active",
      },
      {
        id: "mis.eng.collocation_literal_translation",
        domainId: "english_core",
        name: "Translates collocations literally",
        kind: "vocabulary",
        conceptIds: ["eng.collocation_phraseology", "eng.vocabulary_range"],
        skillIds: ["eng.use_collocation"],
        remediationObjectiveIds: ["obj.english.vocabulary_core"],
        status: "active",
      },
      {
        id: "mis.eng.grammar_role_mismatch",
        domainId: "english_core",
        name: "Chooses grammar form without checking sentence role",
        kind: "grammar",
        conceptIds: ["eng.grammar_accuracy", "eng.sentence_structure"],
        skillIds: ["eng.control_clause_structure", "eng.edit_sentence_errors"],
        remediationObjectiveIds: ["obj.english.grammar_core"],
        status: "active",
      },
      {
        id: "mis.eng.reference_tracking",
        domainId: "english_core",
        name: "Misses pronoun or cohesive reference links",
        kind: "reading",
        conceptIds: ["eng.cohesion_reference", "eng.reading_argument_structure"],
        skillIds: ["eng.track_cohesive_reference", "eng.evaluate_argument_flow"],
        remediationObjectiveIds: ["obj.english.reading_core", "obj.english.grammar_core"],
        status: "active",
      },
      {
        id: "mis.eng.time_pressure_scan_skip",
        domainId: "english_core",
        name: "Skips exact evidence under time pressure",
        kind: "time_management",
        conceptIds: ["eng.reading_detail", "eng.listening_detail"],
        skillIds: ["eng.identify_specific_detail"],
        remediationObjectiveIds: ["obj.english.reading_core", "obj.ielts.reading_listening_beta"],
        status: "draft",
      },
      {
        id: "mis.eng.speaking_fragmented_response",
        domainId: "english_core",
        name: "Gives fragmented speaking responses without clear development",
        kind: "speaking",
        conceptIds: ["eng.speaking_fluency", "eng.spoken_discourse_management"],
        skillIds: ["eng.organize_spoken_response", "eng.sustain_fluent_turn"],
        remediationObjectiveIds: ["obj.english.speaking_core"],
        status: "draft",
      },
      {
        id: "mis.eng.speaking_interaction_breakdown",
        domainId: "english_core",
        name: "Misses prompts or turn-taking signals in speaking interaction",
        kind: "speaking",
        conceptIds: ["eng.interactive_communication", "eng.pronunciation_control"],
        skillIds: ["eng.manage_interactive_communication", "eng.use_pronunciation_features"],
        remediationObjectiveIds: ["obj.english.speaking_core"],
        status: "draft",
      },
    ],
    lessonTemplates: [
      {
        id: "math9.algebra_transform.repair",
        domainId: "mathematics",
        title: "Algebra Transform Repair",
        conceptIds: ["math.algebraic_expression", "math.factorization"],
        skillIds: ["math.simplify_expression", "math.factor_common_terms"],
        prerequisiteIds: ["math.linear_expression", "math.polynomial", "math.fraction_decimal", "math.integer_number"],
        remediationObjectiveIds: ["obj.math.grade6_8.algebra_foundation", "obj.math.grade9.quadratic_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 24,
        masteryTarget: 80,
        tags: ["math9", "repair", "algebra"],
        status: "active",
      },
      {
        id: "math9.factorization.bridge",
        domainId: "mathematics",
        title: "Factorization Bridge",
        conceptIds: ["math.factorization", "math.polynomial"],
        skillIds: ["math.factor_common_terms", "math.factor_polynomial", "math.solve_quadratic_by_factor"],
        prerequisiteIds: ["math.linear_expression", "math.polynomial"],
        remediationObjectiveIds: ["obj.math.grade6_8.algebra_foundation", "obj.math.grade9.quadratic_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 22,
        masteryTarget: 82,
        tags: ["math9", "repair", "factorization"],
        status: "active",
      },
      {
        id: "math9.quadratic_equation.repair",
        domainId: "mathematics",
        title: "Quadratic Equation Repair",
        conceptIds: ["math.quadratic_equation", "math.vieta", "math.factorization"],
        skillIds: ["math.solve_quadratic_by_factor", "math.apply_vieta", "math.analyze_function_graph"],
        prerequisiteIds: ["math.factorization", "math.linear_equation"],
        remediationObjectiveIds: ["obj.math.grade9.quadratic_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 28,
        masteryTarget: 82,
        tags: ["math9", "repair", "quadratic"],
        status: "active",
      },
      {
        id: "math9.geometry_proof.scaffold",
        domainId: "mathematics",
        title: "Geometry Proof Scaffold",
        conceptIds: ["math.plane_geometry", "math.geometry_proof", "math.trigonometry"],
        skillIds: ["math.prove_circle_geometry", "math.geometry_reasoning", "math.use_trig_ratios"],
        prerequisiteIds: ["math.basic_geometry", "math.plane_geometry"],
        remediationObjectiveIds: ["obj.math.grade6_8.geometry_foundation", "obj.math.grade9.miumath_pilot"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 30,
        masteryTarget: 78,
        tags: ["math9", "repair", "geometry"],
        status: "active",
      },
      {
        id: "math1012.g10.function_transform",
        domainId: "mathematics",
        title: "Grade 10 function transformation",
        conceptIds: ["math.functions_graphs", "math.advanced_function", "math.quadratic_equation"],
        skillIds: ["math.analyze_function_graph", "math.analyze_advanced_function", "math.solve_quadratic_by_factor"],
        prerequisiteIds: ["math.factorization", "math.linear_equation", "math.functions_graphs"],
        remediationObjectiveIds: ["obj.math.grade10.function_vector_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 28,
        masteryTarget: 82,
        tags: ["math10", "function", "cluster_import"],
        status: "active",
      },
      {
        id: "math1012.g10.vector_coordinate",
        domainId: "mathematics",
        title: "Grade 10 vector and coordinate geometry",
        conceptIds: ["math.vector_coordinate_geometry", "math.trigonometry", "math.plane_geometry"],
        skillIds: ["math.solve_vector_coordinate_problem", "math.use_trig_ratios", "math.geometry_reasoning"],
        prerequisiteIds: ["math.trigonometry", "math.plane_geometry", "math.basic_geometry"],
        remediationObjectiveIds: ["obj.math.grade10.function_vector_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 30,
        masteryTarget: 80,
        tags: ["math10", "vector", "coordinate", "cluster_import"],
        status: "active",
      },
      {
        id: "math1012.g10.probability_intro",
        domainId: "mathematics",
        title: "Grade 10 probability and counting bridge",
        conceptIds: ["math.combinatorics_probability", "math.probability", "math.statistics"],
        skillIds: ["math.count_combinatoric_cases", "math.compute_probability", "math.interpret_statistics"],
        prerequisiteIds: ["math.probability", "math.statistics", "math.ratio_proportion"],
        remediationObjectiveIds: ["obj.math.grade12.geometry_probability_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 24,
        masteryTarget: 78,
        tags: ["math10", "probability", "cluster_import"],
        status: "reviewed",
      },
      {
        id: "math1012.g11.sequence_series",
        domainId: "mathematics",
        title: "Grade 11 sequence and series",
        conceptIds: ["math.sequence_series", "math.advanced_function"],
        skillIds: ["math.work_with_sequence_series", "math.analyze_advanced_function"],
        prerequisiteIds: ["math.functions_graphs", "math.linear_equation"],
        remediationObjectiveIds: ["obj.math.grade11.algebra_calculus_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 26,
        masteryTarget: 80,
        tags: ["math11", "sequence", "cluster_import"],
        status: "active",
      },
      {
        id: "math1012.g11.exponential_logarithm",
        domainId: "mathematics",
        title: "Grade 11 exponential and logarithm domain",
        conceptIds: ["math.exponential_logarithm", "math.advanced_function"],
        skillIds: ["math.solve_exponential_logarithm", "math.analyze_advanced_function"],
        prerequisiteIds: ["math.advanced_function", "math.functions_graphs", "math.algebraic_expression"],
        remediationObjectiveIds: ["obj.math.grade11.algebra_calculus_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 30,
        masteryTarget: 84,
        tags: ["math11", "logarithm", "domain", "cluster_import"],
        status: "active",
      },
      {
        id: "math1012.g11.calculus_derivative",
        domainId: "mathematics",
        title: "Grade 11 derivative foundation",
        conceptIds: ["math.calculus_foundation", "math.advanced_function"],
        skillIds: ["math.differentiate_basic_function", "math.analyze_advanced_function"],
        prerequisiteIds: ["math.advanced_function", "math.sequence_series", "math.functions_graphs"],
        remediationObjectiveIds: ["obj.math.grade11.algebra_calculus_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 30,
        masteryTarget: 80,
        tags: ["math11", "calculus", "derivative", "cluster_import"],
        status: "reviewed",
      },
      {
        id: "math1012.g12.solid_coordinate_geometry",
        domainId: "mathematics",
        title: "Grade 12 solid and coordinate geometry",
        conceptIds: ["math.solid_geometry_advanced", "math.spatial_geometry", "math.vector_coordinate_geometry"],
        skillIds: ["math.reason_advanced_solid_geometry", "math.solve_vector_coordinate_problem", "math.compute_solid_measure"],
        prerequisiteIds: ["math.spatial_geometry", "math.vector_coordinate_geometry", "math.geometry_proof"],
        remediationObjectiveIds: ["obj.math.grade12.geometry_probability_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 32,
        masteryTarget: 80,
        tags: ["math12", "geometry", "coordinate", "cluster_import"],
        status: "reviewed",
      },
      {
        id: "math1012.g12.combinatorics_probability",
        domainId: "mathematics",
        title: "Grade 12 combinatorics and probability",
        conceptIds: ["math.combinatorics_probability", "math.probability", "math.statistics_advanced"],
        skillIds: ["math.count_combinatoric_cases", "math.compute_probability", "math.analyze_advanced_statistics"],
        prerequisiteIds: ["math.probability", "math.statistics"],
        remediationObjectiveIds: ["obj.math.grade12.geometry_probability_foundation"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 28,
        masteryTarget: 82,
        tags: ["math12", "combinatorics", "probability", "cluster_import"],
        status: "active",
      },
      {
        id: "math1012.g12.exam_synthesis",
        domainId: "mathematics",
        title: "Grade 12 mixed exam synthesis",
        conceptIds: ["math.advanced_function", "math.exponential_logarithm", "math.calculus_foundation", "math.solid_geometry_advanced", "math.combinatorics_probability"],
        skillIds: ["math.analyze_advanced_function", "math.solve_exponential_logarithm", "math.differentiate_basic_function", "math.reason_advanced_solid_geometry", "math.count_combinatoric_cases"],
        prerequisiteIds: ["math.quadratic_equation", "math.functions_graphs", "math.trigonometry", "math.probability"],
        remediationObjectiveIds: [
          "obj.math.grade10.function_vector_foundation",
          "obj.math.grade11.algebra_calculus_foundation",
          "obj.math.grade12.geometry_probability_foundation",
        ],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 35,
        masteryTarget: 78,
        tags: ["math12", "exam", "synthesis", "cluster_import"],
        status: "reviewed",
      },
      {
        id: "eng.core.vocab_collocation.precision",
        domainId: "english_core",
        title: "Vocabulary and Collocation Precision",
        conceptIds: ["eng.vocabulary_range", "eng.collocation_phraseology", "eng.academic_register"],
        skillIds: ["eng.use_collocation", "eng.build_word_family", "eng.choose_register"],
        prerequisiteIds: ["eng.vocabulary_range"],
        remediationObjectiveIds: ["obj.english.vocabulary_core"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 24,
        masteryTarget: 82,
        tags: ["english_core", "collocation", "ielts", "cae", "cpe", "sat"],
        status: "active",
      },
      {
        id: "eng.core.grammar.clause_control",
        domainId: "english_core",
        title: "Grammar Clause Control",
        conceptIds: ["eng.grammar_accuracy", "eng.sentence_structure", "eng.verb_tense_aspect", "eng.cohesion_reference"],
        skillIds: ["eng.control_clause_structure", "eng.control_tense_aspect", "eng.edit_sentence_errors", "eng.track_cohesive_reference"],
        prerequisiteIds: ["eng.sentence_structure"],
        remediationObjectiveIds: ["obj.english.grammar_core"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 26,
        masteryTarget: 84,
        tags: ["english_core", "grammar", "ielts", "cae", "cpe", "sat"],
        status: "active",
      },
      {
        id: "eng.core.reading.inference_bridge",
        domainId: "english_core",
        title: "Reading Inference Bridge",
        conceptIds: ["eng.reading_detail", "eng.reading_inference", "eng.reading_argument_structure", "eng.vocabulary_range"],
        skillIds: ["eng.identify_specific_detail", "eng.infer_implicit_meaning", "eng.evaluate_argument_flow", "eng.use_collocation"],
        prerequisiteIds: ["eng.reading_detail"],
        remediationObjectiveIds: ["obj.english.reading_core", "obj.ielts.reading_listening_beta"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 25,
        masteryTarget: 82,
        tags: ["english_core", "reading", "ielts", "cae", "cpe", "sat"],
        status: "active",
      },
      {
        id: "eng.core.listening.detail_map",
        domainId: "english_core",
        title: "Listening Detail Map",
        conceptIds: ["eng.listening_main_idea", "eng.listening_detail", "eng.listening_inference", "eng.listening_attitude", "eng.vocabulary_range"],
        skillIds: ["eng.identify_listening_main_idea", "eng.identify_specific_detail", "eng.infer_speaker_attitude", "eng.use_collocation"],
        prerequisiteIds: ["eng.listening_detail"],
        remediationObjectiveIds: ["obj.english.listening_core", "obj.ielts.reading_listening_beta"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 22,
        masteryTarget: 80,
        tags: ["english_core", "listening", "ielts", "cae", "cpe"],
        status: "active",
      },
      {
        id: "eng.core.writing.argument_cycle",
        domainId: "english_core",
        title: "Writing Argument Cycle",
        conceptIds: ["eng.academic_writing", "eng.writing_task_response", "eng.paragraph_development", "eng.essay_coherence", "eng.grammar_accuracy", "eng.vocabulary_range"],
        skillIds: ["eng.plan_essay_response", "eng.develop_body_paragraph", "eng.revise_for_coherence", "eng.develop_academic_argument", "eng.control_clause_structure", "eng.use_collocation"],
        prerequisiteIds: ["eng.grammar_accuracy", "eng.vocabulary_range"],
        remediationObjectiveIds: ["obj.english.writing_core", "obj.english.grammar_core", "obj.english.vocabulary_core"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 30,
        masteryTarget: 82,
        tags: ["english_core", "writing", "ielts", "cae", "cpe", "sat"],
        status: "active",
      },
      {
        id: "eng.core.speaking.response_loop",
        domainId: "english_core",
        title: "Speaking Response Loop",
        conceptIds: ["eng.speaking_fluency", "eng.pronunciation_control", "eng.interactive_communication", "eng.spoken_discourse_management", "eng.vocabulary_range", "eng.grammar_accuracy"],
        skillIds: ["eng.organize_spoken_response", "eng.sustain_fluent_turn", "eng.manage_interactive_communication", "eng.use_pronunciation_features", "eng.use_collocation", "eng.control_clause_structure"],
        prerequisiteIds: ["eng.vocabulary_range", "eng.grammar_accuracy"],
        remediationObjectiveIds: ["obj.english.speaking_core", "obj.english.vocabulary_core", "obj.english.grammar_core"],
        stageIds: ["concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "reflection"],
        estimatedMinutes: 28,
        masteryTarget: 80,
        tags: ["english_core", "speaking", "ielts", "cae", "cpe"],
        status: "active",
      },
    ],
    edges: [
      { id: "edge.math.rational_to_expression", from: "math.fraction_decimal", to: "math.algebraic_expression", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.integer_to_linear", from: "math.integer_number", to: "math.linear_expression", type: "prerequisite", weight: 0.7 },
      { id: "edge.math.linear_expression_to_equation", from: "math.linear_expression", to: "math.linear_equation", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.polynomial_to_factorization", from: "math.polynomial", to: "math.factorization", type: "prerequisite", weight: 0.9 },
      { id: "edge.math.ratio_to_word_model", from: "math.ratio_proportion", to: "math.word_problem_modeling", type: "supports", weight: 0.8 },
      { id: "edge.math.basic_geometry_to_plane", from: "math.basic_geometry", to: "math.plane_geometry", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.factorization_to_quadratic", from: "math.factorization", to: "math.quadratic_equation", type: "prerequisite", weight: 0.9 },
      { id: "edge.math.linear_to_quadratic", from: "math.linear_equation", to: "math.quadratic_equation", type: "prerequisite", weight: 0.6 },
      { id: "edge.math.quadratic_to_vieta", from: "math.quadratic_equation", to: "math.vieta", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.linear_to_word_model", from: "math.linear_equation", to: "math.word_problem_modeling", type: "supports", weight: 0.7 },
      { id: "edge.math.plane_to_proof", from: "math.plane_geometry", to: "math.geometry_proof", type: "supports", weight: 0.7 },
      { id: "edge.math.calculator_to_quadratic_check", from: "math.calculator_strategy", to: "math.quadratic_equation", type: "supports", weight: 0.4 },
      { id: "edge.math.calculator_to_function_check", from: "math.calculator_strategy", to: "math.functions_graphs", type: "supports", weight: 0.4 },
      { id: "edge.math.functions_to_advanced_functions", from: "math.functions_graphs", to: "math.advanced_function", type: "prerequisite", weight: 0.9 },
      { id: "edge.math.quadratic_to_advanced_functions", from: "math.quadratic_equation", to: "math.advanced_function", type: "supports", weight: 0.7 },
      { id: "edge.math.trig_to_vector_coordinate", from: "math.trigonometry", to: "math.vector_coordinate_geometry", type: "supports", weight: 0.7 },
      { id: "edge.math.probability_to_combinatorics", from: "math.probability", to: "math.combinatorics_probability", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.statistics_to_advanced_statistics", from: "math.statistics", to: "math.statistics_advanced", type: "prerequisite", weight: 0.7 },
      { id: "edge.math.spatial_to_advanced_solid", from: "math.spatial_geometry", to: "math.solid_geometry_advanced", type: "prerequisite", weight: 0.8 },
      { id: "edge.math.advanced_functions_to_exponential_log", from: "math.advanced_function", to: "math.exponential_logarithm", type: "supports", weight: 0.8 },
      { id: "edge.math.advanced_functions_to_calculus", from: "math.advanced_function", to: "math.calculus_foundation", type: "prerequisite", weight: 0.9 },
      { id: "edge.math.sequence_to_calculus", from: "math.sequence_series", to: "math.calculus_foundation", type: "supports", weight: 0.6 },
      { id: "edge.eng.vocab_to_word_formation", from: "eng.vocabulary_range", to: "eng.word_formation", type: "supports", weight: 0.6 },
      { id: "edge.eng.vocab_to_collocation", from: "eng.vocabulary_range", to: "eng.collocation_phraseology", type: "supports", weight: 0.8 },
      { id: "edge.eng.collocation_to_register", from: "eng.collocation_phraseology", to: "eng.academic_register", type: "supports", weight: 0.7 },
      { id: "edge.eng.sentence_to_grammar", from: "eng.sentence_structure", to: "eng.grammar_accuracy", type: "prerequisite", weight: 0.8 },
      { id: "edge.eng.tense_to_grammar", from: "eng.verb_tense_aspect", to: "eng.grammar_accuracy", type: "supports", weight: 0.7 },
      { id: "edge.eng.grammar_to_cohesion", from: "eng.grammar_accuracy", to: "eng.cohesion_reference", type: "supports", weight: 0.6 },
      { id: "edge.eng.main_idea_to_argument", from: "eng.reading_main_idea", to: "eng.reading_argument_structure", type: "prerequisite", weight: 0.7 },
      { id: "edge.eng.detail_to_inference", from: "eng.reading_detail", to: "eng.reading_inference", type: "prerequisite", weight: 0.8 },
      { id: "edge.eng.inference_to_argument", from: "eng.reading_inference", to: "eng.reading_argument_structure", type: "supports", weight: 0.7 },
      { id: "edge.eng.cohesion_to_argument", from: "eng.cohesion_reference", to: "eng.reading_argument_structure", type: "supports", weight: 0.6 },
      { id: "edge.eng.vocab_to_inference", from: "eng.vocabulary_range", to: "eng.reading_inference", type: "supports", weight: 0.7 },
      { id: "edge.eng.listening_detail_to_inference", from: "eng.listening_detail", to: "eng.listening_inference", type: "prerequisite", weight: 0.8 },
      { id: "edge.eng.listening_attitude_to_inference", from: "eng.listening_attitude", to: "eng.listening_inference", type: "supports", weight: 0.7 },
      { id: "edge.eng.vocab_to_listening_inference", from: "eng.vocabulary_range", to: "eng.listening_inference", type: "supports", weight: 0.6 },
      { id: "edge.eng.grammar_to_writing", from: "eng.grammar_accuracy", to: "eng.academic_writing", type: "supports", weight: 0.8 },
      { id: "edge.eng.task_response_to_writing", from: "eng.writing_task_response", to: "eng.academic_writing", type: "supports", weight: 0.8 },
      { id: "edge.eng.paragraph_to_essay", from: "eng.paragraph_development", to: "eng.essay_coherence", type: "supports", weight: 0.8 },
      { id: "edge.eng.cohesion_to_essay", from: "eng.cohesion_reference", to: "eng.essay_coherence", type: "supports", weight: 0.7 },
      { id: "edge.eng.vocab_to_spoken_discourse", from: "eng.vocabulary_range", to: "eng.spoken_discourse_management", type: "supports", weight: 0.7 },
      { id: "edge.eng.grammar_to_spoken_discourse", from: "eng.grammar_accuracy", to: "eng.spoken_discourse_management", type: "supports", weight: 0.7 },
      { id: "edge.eng.spoken_discourse_to_fluency", from: "eng.spoken_discourse_management", to: "eng.speaking_fluency", type: "supports", weight: 0.8 },
      { id: "edge.eng.fluency_to_interaction", from: "eng.speaking_fluency", to: "eng.interactive_communication", type: "supports", weight: 0.7 },
      { id: "edge.obj.english_vocab_core", from: "obj.english.vocabulary_core", to: "eng.use_collocation", type: "assesses", weight: 0.8 },
      { id: "edge.obj.english_grammar_core", from: "obj.english.grammar_core", to: "eng.control_clause_structure", type: "assesses", weight: 0.8 },
      { id: "edge.obj.english_reading_core", from: "obj.english.reading_core", to: "eng.infer_implicit_meaning", type: "assesses", weight: 0.8 },
      { id: "edge.obj.english_listening_core", from: "obj.english.listening_core", to: "eng.identify_specific_detail", type: "assesses", weight: 0.8 },
      { id: "edge.obj.english_writing_core", from: "obj.english.writing_core", to: "eng.develop_academic_argument", type: "assesses", weight: 0.7 },
      { id: "edge.obj.english_speaking_core", from: "obj.english.speaking_core", to: "eng.organize_spoken_response", type: "assesses", weight: 0.7 },
      { id: "edge.obj.ielts_reads_inference", from: "obj.ielts.reading_inference", to: "eng.infer_implicit_meaning", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade10_function_vector", from: "obj.math.grade10.function_vector_foundation", to: "math.analyze_advanced_function", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade10_vector_coordinate", from: "obj.math.grade10.function_vector_foundation", to: "math.solve_vector_coordinate_problem", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade11_sequence", from: "obj.math.grade11.algebra_calculus_foundation", to: "math.work_with_sequence_series", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade11_log", from: "obj.math.grade11.algebra_calculus_foundation", to: "math.solve_exponential_logarithm", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade11_calculus", from: "obj.math.grade11.algebra_calculus_foundation", to: "math.differentiate_basic_function", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade12_solid", from: "obj.math.grade12.geometry_probability_foundation", to: "math.reason_advanced_solid_geometry", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade12_combinatorics", from: "obj.math.grade12.geometry_probability_foundation", to: "math.count_combinatoric_cases", type: "assesses", weight: 0.8 },
      { id: "edge.obj.math_grade10_to_function_template", from: "obj.math.grade10.function_vector_foundation", to: "math1012.g10.function_transform", type: "supports", weight: 0.8 },
      { id: "edge.obj.math_grade10_to_vector_template", from: "obj.math.grade10.function_vector_foundation", to: "math1012.g10.vector_coordinate", type: "supports", weight: 0.8 },
      { id: "edge.obj.math_grade11_to_sequence_template", from: "obj.math.grade11.algebra_calculus_foundation", to: "math1012.g11.sequence_series", type: "supports", weight: 0.8 },
      { id: "edge.obj.math_grade11_to_log_template", from: "obj.math.grade11.algebra_calculus_foundation", to: "math1012.g11.exponential_logarithm", type: "supports", weight: 0.9 },
      { id: "edge.obj.math_grade11_to_calculus_template", from: "obj.math.grade11.algebra_calculus_foundation", to: "math1012.g11.calculus_derivative", type: "supports", weight: 0.7 },
      { id: "edge.obj.math_grade12_to_solid_template", from: "obj.math.grade12.geometry_probability_foundation", to: "math1012.g12.solid_coordinate_geometry", type: "supports", weight: 0.8 },
      { id: "edge.obj.math_grade12_to_combinatorics_template", from: "obj.math.grade12.geometry_probability_foundation", to: "math1012.g12.combinatorics_probability", type: "supports", weight: 0.9 },
      { id: "edge.obj.math_grade12_to_synthesis_template", from: "obj.math.grade12.geometry_probability_foundation", to: "math1012.g12.exam_synthesis", type: "supports", weight: 0.6 },
      { id: "edge.obj.ielts_rl_beta_inference", from: "obj.ielts.reading_listening_beta", to: "eng.infer_implicit_meaning", type: "assesses", weight: 0.8 },
      { id: "edge.obj.ielts_rl_beta_detail", from: "obj.ielts.reading_listening_beta", to: "eng.identify_specific_detail", type: "assesses", weight: 0.8 },
      { id: "edge.obj.ielts_rl_beta_grammar", from: "obj.ielts.reading_listening_beta", to: "eng.control_clause_structure", type: "assesses", weight: 0.6 },
      { id: "edge.mis.math.factor_vs_expand_remediation", from: "mis.math.factor_vs_expand", to: "obj.math.grade9.quadratic_foundation", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.factor_vs_expand_to_factorization_template", from: "mis.math.factor_vs_expand", to: "math9.factorization.bridge", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.factor_vs_expand_to_quadratic_template", from: "mis.math.factor_vs_expand", to: "math9.quadratic_equation.repair", type: "remediates", weight: 0.7 },
      { id: "edge.mis.math.missing_domain_condition_remediation", from: "mis.math.missing_domain_condition", to: "obj.math.grade9.miumath_pilot", type: "remediates", weight: 0.8 },
      { id: "edge.mis.math.missing_domain_condition_to_algebra_template", from: "mis.math.missing_domain_condition", to: "math9.algebra_transform.repair", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.calculation_slip_remediation", from: "mis.math.calculation_slip", to: "obj.math.grade6_8.number_foundation", type: "remediates", weight: 0.7 },
      { id: "edge.mis.math.reading_prompt_remediation", from: "mis.math.reading_prompt_to_equation", to: "obj.math.grade9.miumath_pilot", type: "remediates", weight: 0.8 },
      { id: "edge.mis.math.function_parameter_confusion_remediation", from: "mis.math.function_parameter_confusion", to: "obj.math.grade10.function_vector_foundation", type: "remediates", weight: 0.8 },
      { id: "edge.mis.math.function_parameter_confusion_to_function_template", from: "mis.math.function_parameter_confusion", to: "math1012.g10.function_transform", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.log_domain_condition_remediation", from: "mis.math.log_domain_condition", to: "obj.math.grade11.algebra_calculus_foundation", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.log_domain_condition_to_log_template", from: "mis.math.log_domain_condition", to: "math1012.g11.exponential_logarithm", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.combinatorics_overcount_remediation", from: "mis.math.combinatorics_overcount", to: "obj.math.grade12.geometry_probability_foundation", type: "remediates", weight: 0.8 },
      { id: "edge.mis.math.combinatorics_overcount_to_probability_bridge", from: "mis.math.combinatorics_overcount", to: "math1012.g10.probability_intro", type: "remediates", weight: 0.6 },
      { id: "edge.mis.math.combinatorics_overcount_to_combinatorics_template", from: "mis.math.combinatorics_overcount", to: "math1012.g12.combinatorics_probability", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.casio_operation_error_grade9", from: "mis.math.casio_operation_error", to: "obj.math.grade9.miumath_pilot", type: "remediates", weight: 0.7 },
      { id: "edge.mis.math.casio_operation_error_grade10", from: "mis.math.casio_operation_error", to: "obj.math.grade10.function_vector_foundation", type: "remediates", weight: 0.5 },
      { id: "edge.mis.math.casio_operation_error_to_function_template", from: "mis.math.casio_operation_error", to: "math1012.g10.function_transform", type: "remediates", weight: 0.5 },
      { id: "edge.mis.math.geometry_proof_gap_remediation", from: "mis.math.geometry_proof_gap", to: "obj.math.grade9.miumath_pilot", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.geometry_proof_gap_to_template", from: "mis.math.geometry_proof_gap", to: "math9.geometry_proof.scaffold", type: "remediates", weight: 0.9 },
      { id: "edge.mis.math.geometry_proof_gap_to_vector_template", from: "mis.math.geometry_proof_gap", to: "math1012.g10.vector_coordinate", type: "remediates", weight: 0.5 },
      { id: "edge.mis.eng.inference_literal_only_remediation", from: "mis.eng.inference_literal_only", to: "obj.english.reading_core", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.inference_literal_only_ielts_rl_beta", from: "mis.eng.inference_literal_only", to: "obj.ielts.reading_listening_beta", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.inference_literal_only_to_reading_template", from: "mis.eng.inference_literal_only", to: "eng.core.reading.inference_bridge", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.word_family_guessing_remediation", from: "mis.eng.word_family_guessing", to: "obj.english.vocabulary_core", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.word_family_guessing_to_vocab_template", from: "mis.eng.word_family_guessing", to: "eng.core.vocab_collocation.precision", type: "remediates", weight: 0.7 },
      { id: "edge.mis.eng.collocation_literal_translation_remediation", from: "mis.eng.collocation_literal_translation", to: "obj.english.vocabulary_core", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.collocation_literal_translation_to_vocab_template", from: "mis.eng.collocation_literal_translation", to: "eng.core.vocab_collocation.precision", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.grammar_role_mismatch_remediation", from: "mis.eng.grammar_role_mismatch", to: "obj.english.grammar_core", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.grammar_role_mismatch_to_grammar_template", from: "mis.eng.grammar_role_mismatch", to: "eng.core.grammar.clause_control", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.reference_tracking_remediation", from: "mis.eng.reference_tracking", to: "obj.english.reading_core", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.reference_tracking_to_writing_template", from: "mis.eng.reference_tracking", to: "eng.core.writing.argument_cycle", type: "remediates", weight: 0.6 },
      { id: "edge.mis.eng.time_pressure_scan_skip_remediation", from: "mis.eng.time_pressure_scan_skip", to: "obj.english.reading_core", type: "remediates", weight: 0.6 },
      { id: "edge.mis.eng.time_pressure_scan_skip_ielts_rl_beta", from: "mis.eng.time_pressure_scan_skip", to: "obj.ielts.reading_listening_beta", type: "remediates", weight: 0.7 },
      { id: "edge.mis.eng.time_pressure_scan_skip_to_listening_template", from: "mis.eng.time_pressure_scan_skip", to: "eng.core.listening.detail_map", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.speaking_fragmented_response_remediation", from: "mis.eng.speaking_fragmented_response", to: "obj.english.speaking_core", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.speaking_fragmented_response_to_speaking_template", from: "mis.eng.speaking_fragmented_response", to: "eng.core.speaking.response_loop", type: "remediates", weight: 0.9 },
      { id: "edge.mis.eng.speaking_interaction_breakdown_remediation", from: "mis.eng.speaking_interaction_breakdown", to: "obj.english.speaking_core", type: "remediates", weight: 0.8 },
      { id: "edge.mis.eng.speaking_interaction_breakdown_to_speaking_template", from: "mis.eng.speaking_interaction_breakdown", to: "eng.core.speaking.response_loop", type: "remediates", weight: 0.8 },
    ],
    programMaps: [
      {
        programId: "vn_math_6_8",
        domainIds: ["mathematics"],
        conceptIds: [
          "math.integer_number",
          "math.fraction_decimal",
          "math.ratio_proportion",
          "math.basic_geometry",
          "math.linear_expression",
          "math.inequality",
          "math.polynomial",
          "math.algebraic_expression",
          "math.statistics",
          "math.probability",
        ],
        skillIds: [
          "math.operate_rational_numbers",
          "math.convert_fraction_decimal",
          "math.solve_ratio_problem",
          "math.reason_basic_geometry",
          "math.manipulate_linear_expression",
          "math.solve_inequality",
          "math.factor_polynomial",
          "math.simplify_expression",
          "math.interpret_statistics",
          "math.compute_probability",
        ],
        objectiveIds: [
          "obj.math.grade6_8.number_foundation",
          "obj.math.grade6_8.algebra_foundation",
          "obj.math.grade6_8.geometry_foundation",
        ],
        entryObjectiveIds: ["obj.math.grade6_8.number_foundation"],
      },
      {
        programId: "vn_math_6_9",
        domainIds: ["mathematics"],
        conceptIds: [
          "math.integer_number",
          "math.fraction_decimal",
          "math.ratio_proportion",
          "math.basic_geometry",
          "math.linear_expression",
          "math.inequality",
          "math.polynomial",
          "math.algebraic_expression",
          "math.factorization",
          "math.linear_equation",
          "math.quadratic_equation",
          "math.vieta",
          "math.functions_graphs",
          "math.word_problem_modeling",
          "math.plane_geometry",
          "math.geometry_proof",
          "math.trigonometry",
          "math.spatial_geometry",
          "math.statistics",
          "math.probability",
          "math.calculator_strategy",
        ],
        skillIds: [
          "math.operate_rational_numbers",
          "math.convert_fraction_decimal",
          "math.solve_ratio_problem",
          "math.reason_basic_geometry",
          "math.manipulate_linear_expression",
          "math.solve_inequality",
          "math.factor_polynomial",
          "math.simplify_expression",
          "math.optimize_expression",
          "math.factor_common_terms",
          "math.solve_linear_equation",
          "math.solve_system",
          "math.solve_quadratic_by_factor",
          "math.apply_vieta",
          "math.analyze_function_graph",
          "math.model_word_problem",
          "math.prove_circle_geometry",
          "math.geometry_reasoning",
          "math.use_trig_ratios",
          "math.compute_solid_measure",
          "math.interpret_statistics",
          "math.compute_probability",
          "math.use_calculator_strategy",
        ],
        objectiveIds: [
          "obj.math.grade6_8.number_foundation",
          "obj.math.grade6_8.algebra_foundation",
          "obj.math.grade6_8.geometry_foundation",
          "obj.math.grade9.quadratic_foundation",
          "obj.math.grade9.miumath_pilot",
        ],
        entryObjectiveIds: ["obj.math.grade6_8.number_foundation", "obj.math.grade9.quadratic_foundation"],
      },
      {
        programId: "vn_math_10_12",
        domainIds: ["mathematics"],
        conceptIds: [
          "math.quadratic_equation",
          "math.functions_graphs",
          "math.trigonometry",
          "math.spatial_geometry",
          "math.statistics",
          "math.probability",
          "math.advanced_function",
          "math.vector_coordinate_geometry",
          "math.sequence_series",
          "math.exponential_logarithm",
          "math.calculus_foundation",
          "math.solid_geometry_advanced",
          "math.combinatorics_probability",
          "math.statistics_advanced",
        ],
        skillIds: [
          "math.solve_quadratic_by_factor",
          "math.analyze_function_graph",
          "math.use_trig_ratios",
          "math.compute_solid_measure",
          "math.interpret_statistics",
          "math.compute_probability",
          "math.analyze_advanced_function",
          "math.solve_vector_coordinate_problem",
          "math.work_with_sequence_series",
          "math.solve_exponential_logarithm",
          "math.differentiate_basic_function",
          "math.reason_advanced_solid_geometry",
          "math.count_combinatoric_cases",
          "math.analyze_advanced_statistics",
        ],
        objectiveIds: [
          "obj.math.grade10.function_vector_foundation",
          "obj.math.grade11.algebra_calculus_foundation",
          "obj.math.grade12.geometry_probability_foundation",
        ],
        entryObjectiveIds: ["obj.math.grade10.function_vector_foundation"],
        exitObjectiveIds: ["obj.math.grade12.geometry_probability_foundation"],
      },
      {
        programId: "ielts",
        domainIds: ["english_core"],
        conceptIds: [
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
        ],
        skillIds: [
          "eng.use_collocation",
          "eng.build_word_family",
          "eng.choose_register",
          "eng.control_clause_structure",
          "eng.control_tense_aspect",
          "eng.edit_sentence_errors",
          "eng.track_cohesive_reference",
          "eng.identify_main_idea",
          "eng.identify_specific_detail",
          "eng.infer_implicit_meaning",
          "eng.evaluate_argument_flow",
          "eng.identify_listening_main_idea",
          "eng.infer_speaker_attitude",
          "eng.develop_academic_argument",
          "eng.plan_essay_response",
          "eng.develop_body_paragraph",
          "eng.revise_for_coherence",
          "eng.write_overview_summary",
          "eng.organize_spoken_response",
          "eng.sustain_fluent_turn",
          "eng.manage_interactive_communication",
          "eng.use_pronunciation_features",
        ],
        objectiveIds: [
          "obj.english.vocabulary_core",
          "obj.english.grammar_core",
          "obj.english.reading_core",
          "obj.english.listening_core",
          "obj.english.writing_core",
          "obj.english.speaking_core",
          "obj.ielts.reading_inference",
          "obj.ielts.reading_listening_beta",
        ],
        entryObjectiveIds: ["obj.english.vocabulary_core", "obj.english.grammar_core"],
      },
      {
        programId: "sat",
        domainIds: ["mathematics", "english_core"],
        conceptIds: [
          "math.linear_equation",
          "math.quadratic_equation",
          "math.functions_graphs",
          "math.word_problem_modeling",
          "math.statistics",
          "eng.vocabulary_range",
          "eng.grammar_accuracy",
          "eng.sentence_structure",
          "eng.reading_main_idea",
          "eng.reading_detail",
          "eng.reading_inference",
          "eng.reading_argument_structure",
        ],
        skillIds: [
          "math.solve_linear_equation",
          "math.solve_quadratic_by_factor",
          "math.analyze_function_graph",
          "math.model_word_problem",
          "math.interpret_statistics",
          "eng.use_collocation",
          "eng.control_clause_structure",
          "eng.edit_sentence_errors",
          "eng.identify_main_idea",
          "eng.identify_specific_detail",
          "eng.infer_implicit_meaning",
          "eng.evaluate_argument_flow",
        ],
        objectiveIds: ["obj.sat.math_core", "obj.sat.rw_core", "obj.english.vocabulary_core", "obj.english.grammar_core", "obj.english.reading_core"],
      },
      {
        programId: "cae",
        domainIds: ["english_core"],
        conceptIds: [
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
        ],
        skillIds: [
          "eng.use_collocation",
          "eng.build_word_family",
          "eng.choose_register",
          "eng.control_clause_structure",
          "eng.control_tense_aspect",
          "eng.edit_sentence_errors",
          "eng.track_cohesive_reference",
          "eng.identify_main_idea",
          "eng.identify_specific_detail",
          "eng.infer_implicit_meaning",
          "eng.evaluate_argument_flow",
          "eng.identify_listening_main_idea",
          "eng.infer_speaker_attitude",
          "eng.develop_academic_argument",
          "eng.plan_essay_response",
          "eng.develop_body_paragraph",
          "eng.revise_for_coherence",
          "eng.write_overview_summary",
          "eng.organize_spoken_response",
          "eng.sustain_fluent_turn",
          "eng.manage_interactive_communication",
          "eng.use_pronunciation_features",
        ],
        objectiveIds: [
          "obj.english.vocabulary_core",
          "obj.english.grammar_core",
          "obj.english.reading_core",
          "obj.english.listening_core",
          "obj.english.writing_core",
          "obj.english.speaking_core",
        ],
        entryObjectiveIds: ["obj.english.vocabulary_core", "obj.english.grammar_core"],
      },
      {
        programId: "cpe",
        domainIds: ["english_core"],
        conceptIds: [
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
        ],
        skillIds: [
          "eng.use_collocation",
          "eng.build_word_family",
          "eng.choose_register",
          "eng.control_clause_structure",
          "eng.control_tense_aspect",
          "eng.edit_sentence_errors",
          "eng.track_cohesive_reference",
          "eng.identify_main_idea",
          "eng.identify_specific_detail",
          "eng.infer_implicit_meaning",
          "eng.evaluate_argument_flow",
          "eng.identify_listening_main_idea",
          "eng.infer_speaker_attitude",
          "eng.develop_academic_argument",
          "eng.plan_essay_response",
          "eng.develop_body_paragraph",
          "eng.revise_for_coherence",
          "eng.write_overview_summary",
          "eng.organize_spoken_response",
          "eng.sustain_fluent_turn",
          "eng.manage_interactive_communication",
          "eng.use_pronunciation_features",
        ],
        objectiveIds: [
          "obj.english.vocabulary_core",
          "obj.english.grammar_core",
          "obj.english.reading_core",
          "obj.english.listening_core",
          "obj.english.writing_core",
          "obj.english.speaking_core",
        ],
        entryObjectiveIds: ["obj.english.vocabulary_core", "obj.english.grammar_core"],
      },
    ],
  };

  extendVietnameseMathThcsTaxonomy(graph);

  return assertValidKnowledgeGraph(graph);
}

function extendVietnameseMathThcsTaxonomy(graph: KnowledgeGraph): void {
  upsertById(graph.programs, [
    { id: "vn_math_thcs", name: "VN Math THCS", kind: "curriculum", domainIds: ["mathematics"], level: "lower_secondary_integrated", status: "active" },
    { id: "vn_math_6", name: "VN Math 6", kind: "curriculum", domainIds: ["mathematics"], level: "grade_6", status: "active" },
    { id: "vn_math_7", name: "VN Math 7", kind: "curriculum", domainIds: ["mathematics"], level: "grade_7", status: "active" },
    { id: "vn_math_8", name: "VN Math 8", kind: "curriculum", domainIds: ["mathematics"], level: "grade_8", status: "active" },
    { id: "vn_math_9", name: "VN Math 9", kind: "curriculum", domainIds: ["mathematics"], level: "grade_9", status: "active" },
    { id: "vn_math_vao_10", name: "VN Math On Vao 10", kind: "exam", domainIds: ["mathematics"], level: "grade_9_exam10", status: "active" },
  ]);

  upsertById(graph.concepts, [
    { id: "math.natural_number_set", domainId: "mathematics", name: "Natural numbers and sets", gradeBand: "6", tags: ["grade6", "number"], status: "active" },
    { id: "math.divisibility_number_theory", domainId: "mathematics", name: "Divisibility, primes, GCD and LCM", gradeBand: "6-9", tags: ["grade6", "number", "advanced"], status: "active" },
    { id: "math.rational_real_number", domainId: "mathematics", name: "Rational and real numbers", gradeBand: "7-9", tags: ["grade7", "number"], status: "active" },
    { id: "math.percent_practical", domainId: "mathematics", name: "Percent and practical arithmetic", gradeBand: "6-9", tags: ["number", "word_problem"], status: "active" },
    { id: "math.triangle_geometry", domainId: "mathematics", name: "Triangle geometry", gradeBand: "7-8", tags: ["geometry"], status: "active" },
    { id: "math.triangle_quadrilateral_geometry", domainId: "mathematics", name: "Triangle and quadrilateral geometry", gradeBand: "8", tags: ["geometry"], status: "active" },
    { id: "math.similarity_thales", domainId: "mathematics", name: "Thales theorem and similarity", gradeBand: "8-9", tags: ["geometry"], status: "active" },
    { id: "math.algebraic_fraction", domainId: "mathematics", name: "Algebraic fractions", gradeBand: "8-9", tags: ["algebra"], status: "active" },
    { id: "math.radicals_expression", domainId: "mathematics", name: "Radicals and radical expressions", gradeBand: "9", tags: ["grade9", "algebra"], status: "active" },
    { id: "math.linear_system_two_variables", domainId: "mathematics", name: "Linear systems in two variables", gradeBand: "9", tags: ["grade9", "equation"], status: "active" },
    { id: "math.irrational_equation", domainId: "mathematics", name: "Irrational and higher-degree equations", gradeBand: "9", tags: ["exam10", "advanced"], status: "active" },
    { id: "math.linear_function", domainId: "mathematics", name: "Linear function", gradeBand: "9", tags: ["function"], status: "active" },
    { id: "math.quadratic_function_graph", domainId: "mathematics", name: "Quadratic function graph", gradeBand: "9", tags: ["function", "exam10"], status: "active" },
    { id: "math.coordinate_geometry", domainId: "mathematics", name: "Coordinate geometry", gradeBand: "9-10", tags: ["function", "geometry"], status: "active" },
    { id: "math.right_triangle_metric_relations", domainId: "mathematics", name: "Right-triangle metric relations", gradeBand: "9", tags: ["geometry", "trigonometry"], status: "active" },
    { id: "math.circle_geometry", domainId: "mathematics", name: "Circle geometry", gradeBand: "9", tags: ["geometry", "exam10"], status: "active" },
    { id: "math.inscribed_quadrilateral", domainId: "mathematics", name: "Inscribed quadrilateral", gradeBand: "9", tags: ["geometry", "exam10"], status: "active" },
    { id: "math.tangent_secant_geometry", domainId: "mathematics", name: "Tangent and secant geometry", gradeBand: "9", tags: ["geometry", "exam10"], status: "active" },
    { id: "math.solid_cylinder_cone_sphere", domainId: "mathematics", name: "Cylinder, cone and sphere", gradeBand: "9", tags: ["spatial_geometry"], status: "active" },
    { id: "math.statistics_grouped_data", domainId: "mathematics", name: "Grouped data and statistical measures", gradeBand: "9", tags: ["statistics"], status: "active" },
    { id: "math.experimental_probability", domainId: "mathematics", name: "Experimental probability", gradeBand: "8-9", tags: ["probability"], status: "active" },
    { id: "math.advanced_inequality_extrema", domainId: "mathematics", name: "Inequality and extrema", gradeBand: "8-10", tags: ["advanced", "exam10"], status: "active" },
    { id: "math.exam10_synthesis", domainId: "mathematics", name: "Grade 10 entrance synthesis", gradeBand: "9", tags: ["exam10", "synthesis"], status: "active" },
  ]);

  upsertById(graph.skills, [
    { id: "math.work_with_sets_natural_numbers", domainId: "mathematics", name: "Work with sets and natural numbers", conceptIds: ["math.natural_number_set"], tags: ["grade6"], status: "active" },
    { id: "math.apply_divisibility_prime_gcd_lcm", domainId: "mathematics", name: "Apply divisibility, primes, GCD and LCM", conceptIds: ["math.divisibility_number_theory"], tags: ["grade6", "advanced"], status: "active" },
    { id: "math.operate_integers", domainId: "mathematics", name: "Operate with integers", conceptIds: ["math.integer_number"], tags: ["grade6"], status: "active" },
    { id: "math.operate_fractions_decimals_percent", domainId: "mathematics", name: "Operate with fractions, decimals and percent", conceptIds: ["math.fraction_decimal", "math.percent_practical"], tags: ["grade6"], status: "active" },
    { id: "math.reason_triangle_geometry", domainId: "mathematics", name: "Reason with triangle geometry", conceptIds: ["math.triangle_geometry", "math.basic_geometry"], tags: ["grade7"], status: "active" },
    { id: "math.transform_algebraic_fraction", domainId: "mathematics", name: "Transform algebraic fractions", conceptIds: ["math.algebraic_fraction", "math.algebraic_expression"], tags: ["grade8"], status: "active" },
    { id: "math.reason_triangle_quadrilateral", domainId: "mathematics", name: "Reason with triangles and quadrilaterals", conceptIds: ["math.triangle_quadrilateral_geometry", "math.plane_geometry"], tags: ["grade8"], status: "active" },
    { id: "math.apply_similarity_thales", domainId: "mathematics", name: "Apply Thales theorem and similarity", conceptIds: ["math.similarity_thales", "math.plane_geometry"], tags: ["grade8"], status: "active" },
    { id: "math.simplify_radical_expression", domainId: "mathematics", name: "Simplify radical expressions", conceptIds: ["math.radicals_expression", "math.algebraic_expression"], tags: ["grade9", "exam10"], status: "active" },
    { id: "math.evaluate_radical_expression", domainId: "mathematics", name: "Evaluate radical expressions", conceptIds: ["math.radicals_expression"], tags: ["grade9"], status: "active" },
    { id: "math.solve_linear_system_two_variables", domainId: "mathematics", name: "Solve two-variable linear systems", conceptIds: ["math.linear_system_two_variables", "math.linear_equation"], tags: ["grade9"], status: "active" },
    { id: "math.solve_irrational_equation", domainId: "mathematics", name: "Solve irrational and reducible equations", conceptIds: ["math.irrational_equation", "math.radicals_expression"], tags: ["exam10", "advanced"], status: "active" },
    { id: "math.analyze_linear_function", domainId: "mathematics", name: "Analyze linear functions", conceptIds: ["math.linear_function", "math.functions_graphs"], tags: ["grade9"], status: "active" },
    { id: "math.analyze_parabola_line_intersection", domainId: "mathematics", name: "Analyze parabola-line intersections", conceptIds: ["math.quadratic_function_graph", "math.quadratic_equation"], tags: ["grade9", "exam10"], status: "active" },
    { id: "math.solve_coordinate_geometry_problem", domainId: "mathematics", name: "Solve coordinate geometry problems", conceptIds: ["math.coordinate_geometry", "math.functions_graphs"], tags: ["grade9", "exam10"], status: "active" },
    { id: "math.model_motion_problem", domainId: "mathematics", name: "Model motion word problems", conceptIds: ["math.word_problem_modeling", "math.linear_equation"], tags: ["exam10"], status: "active" },
    { id: "math.model_productivity_problem", domainId: "mathematics", name: "Model productivity word problems", conceptIds: ["math.word_problem_modeling", "math.linear_system_two_variables"], tags: ["exam10"], status: "active" },
    { id: "math.model_practical_arithmetic_problem", domainId: "mathematics", name: "Model percent, mixture and practical arithmetic problems", conceptIds: ["math.word_problem_modeling", "math.percent_practical"], tags: ["exam10"], status: "active" },
    { id: "math.use_right_triangle_metric_relations", domainId: "mathematics", name: "Use right-triangle metric relations", conceptIds: ["math.right_triangle_metric_relations", "math.trigonometry"], tags: ["grade9"], status: "active" },
    { id: "math.model_height_distance_trig", domainId: "mathematics", name: "Model height and distance with trigonometry", conceptIds: ["math.trigonometry", "math.word_problem_modeling"], tags: ["exam10"], status: "active" },
    { id: "math.use_circle_angle_metric_relations", domainId: "mathematics", name: "Use circle angle and metric relations", conceptIds: ["math.circle_geometry", "math.plane_geometry"], tags: ["grade9"], status: "active" },
    { id: "math.prove_inscribed_quadrilateral", domainId: "mathematics", name: "Prove inscribed quadrilaterals", conceptIds: ["math.inscribed_quadrilateral", "math.circle_geometry"], tags: ["exam10"], status: "active" },
    { id: "math.prove_tangent_secant_relations", domainId: "mathematics", name: "Prove tangent and secant relations", conceptIds: ["math.tangent_secant_geometry", "math.circle_geometry"], tags: ["exam10"], status: "active" },
    { id: "math.compute_cylinder_cone_sphere_measure", domainId: "mathematics", name: "Compute cylinder, cone and sphere measures", conceptIds: ["math.solid_cylinder_cone_sphere", "math.spatial_geometry"], tags: ["grade9"], status: "active" },
    { id: "math.interpret_grouped_frequency_table", domainId: "mathematics", name: "Interpret grouped frequency tables", conceptIds: ["math.statistics_grouped_data", "math.statistics"], tags: ["grade9"], status: "active" },
    { id: "math.interpret_charts", domainId: "mathematics", name: "Interpret statistical charts", conceptIds: ["math.statistics"], tags: ["grade7", "grade9"], status: "active" },
    { id: "math.compute_simple_probability", domainId: "mathematics", name: "Compute simple probability", conceptIds: ["math.probability"], tags: ["grade8", "grade9"], status: "active" },
    { id: "math.estimate_experimental_probability", domainId: "mathematics", name: "Estimate experimental probability", conceptIds: ["math.experimental_probability", "math.probability"], tags: ["grade8", "grade9"], status: "active" },
    { id: "math.solve_inequality_extrema_problem", domainId: "mathematics", name: "Solve inequality and extrema problems", conceptIds: ["math.advanced_inequality_extrema", "math.algebraic_expression"], tags: ["advanced", "exam10"], status: "active" },
  ]);

  upsertById(graph.objectives, [
    {
      id: "obj.math.grade6.core",
      domainId: "mathematics",
      name: "Grade 6 core math path",
      programIds: ["vn_math_6", "vn_math_thcs", "vn_math_6_8", "vn_math_6_9"],
      conceptIds: ["math.natural_number_set", "math.divisibility_number_theory", "math.integer_number", "math.fraction_decimal", "math.percent_practical", "math.basic_geometry"],
      skillIds: ["math.work_with_sets_natural_numbers", "math.apply_divisibility_prime_gcd_lcm", "math.operate_integers", "math.operate_fractions_decimals_percent", "math.reason_basic_geometry"],
      status: "active",
    },
    {
      id: "obj.math.grade7.core",
      domainId: "mathematics",
      name: "Grade 7 core math path",
      programIds: ["vn_math_7", "vn_math_thcs", "vn_math_6_8", "vn_math_6_9"],
      conceptIds: ["math.rational_real_number", "math.ratio_proportion", "math.linear_expression", "math.triangle_geometry", "math.statistics", "math.probability"],
      skillIds: ["math.operate_rational_numbers", "math.solve_ratio_problem", "math.manipulate_linear_expression", "math.reason_triangle_geometry", "math.interpret_charts", "math.compute_simple_probability"],
      status: "active",
    },
    {
      id: "obj.math.grade8.core",
      domainId: "mathematics",
      name: "Grade 8 core math path",
      programIds: ["vn_math_8", "vn_math_thcs", "vn_math_6_8", "vn_math_6_9"],
      conceptIds: ["math.polynomial", "math.factorization", "math.algebraic_fraction", "math.linear_equation", "math.inequality", "math.triangle_quadrilateral_geometry", "math.similarity_thales"],
      skillIds: ["math.factor_polynomial", "math.factor_common_terms", "math.transform_algebraic_fraction", "math.solve_linear_equation", "math.solve_inequality", "math.reason_triangle_quadrilateral", "math.apply_similarity_thales"],
      status: "active",
    },
    {
      id: "obj.math.grade9.core",
      domainId: "mathematics",
      name: "Grade 9 core math path",
      programIds: ["vn_math_9", "vn_math_thcs", "vn_math_6_9", "vn_math_vao_10"],
      conceptIds: ["math.radicals_expression", "math.linear_system_two_variables", "math.quadratic_equation", "math.vieta", "math.functions_graphs", "math.linear_function", "math.quadratic_function_graph", "math.right_triangle_metric_relations", "math.circle_geometry", "math.spatial_geometry", "math.statistics_grouped_data", "math.probability"],
      skillIds: ["math.simplify_radical_expression", "math.solve_linear_system_two_variables", "math.solve_quadratic_by_factor", "math.apply_vieta", "math.analyze_function_graph", "math.analyze_linear_function", "math.analyze_parabola_line_intersection", "math.use_right_triangle_metric_relations", "math.use_circle_angle_metric_relations", "math.compute_solid_measure", "math.interpret_grouped_frequency_table", "math.compute_simple_probability"],
      status: "active",
    },
    {
      id: "obj.math.vao10.core",
      domainId: "mathematics",
      name: "Grade 10 entrance exam core path",
      programIds: ["vn_math_vao_10", "vn_math_thcs", "vn_math_6_9"],
      conceptIds: ["math.exam10_synthesis", "math.radicals_expression", "math.irrational_equation", "math.advanced_inequality_extrema", "math.vieta", "math.quadratic_function_graph", "math.word_problem_modeling", "math.coordinate_geometry", "math.circle_geometry", "math.inscribed_quadrilateral", "math.tangent_secant_geometry"],
      skillIds: ["math.simplify_radical_expression", "math.solve_irrational_equation", "math.solve_inequality_extrema_problem", "math.apply_vieta", "math.analyze_parabola_line_intersection", "math.model_word_problem", "math.solve_coordinate_geometry_problem", "math.prove_inscribed_quadrilateral", "math.prove_tangent_secant_relations", "math.geometry_reasoning"],
      status: "active",
    },
  ]);

  upsertById(graph.lessonTemplates, [
    {
      id: "math.thcs.grade6.number_foundation",
      domainId: "mathematics",
      title: "Grade 6 Number Foundation",
      conceptIds: ["math.natural_number_set", "math.divisibility_number_theory", "math.integer_number", "math.fraction_decimal"],
      skillIds: ["math.work_with_sets_natural_numbers", "math.apply_divisibility_prime_gcd_lcm", "math.operate_integers", "math.operate_fractions_decimals_percent"],
      prerequisiteIds: [],
      remediationObjectiveIds: ["obj.math.grade6.core", "obj.math.grade6_8.number_foundation"],
      stageIds: ["diagnostic", "concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review"],
      estimatedMinutes: 30,
      masteryTarget: 82,
      tags: ["math6", "number", "thcs"],
      status: "active",
    },
    {
      id: "math.thcs.grade8.algebra_bridge",
      domainId: "mathematics",
      title: "Grade 8 Algebra Bridge",
      conceptIds: ["math.polynomial", "math.factorization", "math.algebraic_fraction", "math.linear_equation"],
      skillIds: ["math.factor_polynomial", "math.factor_common_terms", "math.transform_algebraic_fraction", "math.solve_linear_equation"],
      prerequisiteIds: ["math.linear_expression", "math.rational_real_number"],
      remediationObjectiveIds: ["obj.math.grade8.core", "obj.math.grade6_8.algebra_foundation"],
      stageIds: ["diagnostic", "concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review"],
      estimatedMinutes: 32,
      masteryTarget: 82,
      tags: ["math8", "algebra", "thcs"],
      status: "active",
    },
    {
      id: "math.thcs.grade9.exam10_synthesis",
      domainId: "mathematics",
      title: "Grade 9 to Entrance Exam Synthesis",
      conceptIds: ["math.exam10_synthesis", "math.radicals_expression", "math.quadratic_equation", "math.vieta", "math.circle_geometry", "math.word_problem_modeling"],
      skillIds: ["math.simplify_radical_expression", "math.solve_quadratic_by_factor", "math.apply_vieta", "math.geometry_reasoning", "math.model_word_problem"],
      prerequisiteIds: ["math.factorization", "math.linear_equation", "math.plane_geometry"],
      remediationObjectiveIds: ["obj.math.grade9.core", "obj.math.vao10.core", "obj.math.grade9.miumath_pilot"],
      stageIds: ["diagnostic", "concept_summary", "worked_example", "guided_steps", "independent_set", "mixed_review", "mock_exam"],
      estimatedMinutes: 40,
      masteryTarget: 84,
      tags: ["math9", "exam10", "thcs"],
      status: "active",
    },
  ]);

  upsertById(graph.edges, [
    { id: "edge.math.natural_to_divisibility", from: "math.natural_number_set", to: "math.divisibility_number_theory", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.integer_to_rational_real", from: "math.integer_number", to: "math.rational_real_number", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.fraction_to_percent_practical", from: "math.fraction_decimal", to: "math.percent_practical", type: "supports", weight: 0.8 },
    { id: "edge.math.rational_to_algebraic_fraction", from: "math.rational_real_number", to: "math.algebraic_fraction", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.factorization_to_algebraic_fraction", from: "math.factorization", to: "math.algebraic_fraction", type: "supports", weight: 0.8 },
    { id: "edge.math.algebraic_fraction_to_radicals", from: "math.algebraic_fraction", to: "math.radicals_expression", type: "supports", weight: 0.7 },
    { id: "edge.math.linear_equation_to_linear_system", from: "math.linear_equation", to: "math.linear_system_two_variables", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.radicals_to_irrational_equation", from: "math.radicals_expression", to: "math.irrational_equation", type: "prerequisite", weight: 0.9 },
    { id: "edge.math.linear_function_to_quadratic_graph", from: "math.linear_function", to: "math.quadratic_function_graph", type: "supports", weight: 0.7 },
    { id: "edge.math.quadratic_to_quadratic_graph", from: "math.quadratic_equation", to: "math.quadratic_function_graph", type: "supports", weight: 0.8 },
    { id: "edge.math.functions_to_coordinate_geometry", from: "math.functions_graphs", to: "math.coordinate_geometry", type: "supports", weight: 0.7 },
    { id: "edge.math.basic_to_triangle_geometry", from: "math.basic_geometry", to: "math.triangle_geometry", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.triangle_to_quadrilateral", from: "math.triangle_geometry", to: "math.triangle_quadrilateral_geometry", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.quadrilateral_to_similarity", from: "math.triangle_quadrilateral_geometry", to: "math.similarity_thales", type: "supports", weight: 0.7 },
    { id: "edge.math.similarity_to_trig", from: "math.similarity_thales", to: "math.trigonometry", type: "supports", weight: 0.7 },
    { id: "edge.math.trig_to_right_triangle_metric", from: "math.trigonometry", to: "math.right_triangle_metric_relations", type: "supports", weight: 0.8 },
    { id: "edge.math.plane_to_circle_geometry", from: "math.plane_geometry", to: "math.circle_geometry", type: "prerequisite", weight: 0.8 },
    { id: "edge.math.circle_to_inscribed_quad", from: "math.circle_geometry", to: "math.inscribed_quadrilateral", type: "supports", weight: 0.8 },
    { id: "edge.math.circle_to_tangent_secant", from: "math.circle_geometry", to: "math.tangent_secant_geometry", type: "supports", weight: 0.8 },
    { id: "edge.math.spatial_to_cylinder_cone_sphere", from: "math.spatial_geometry", to: "math.solid_cylinder_cone_sphere", type: "supports", weight: 0.8 },
    { id: "edge.math.statistics_to_grouped_data", from: "math.statistics", to: "math.statistics_grouped_data", type: "supports", weight: 0.8 },
    { id: "edge.math.probability_to_experimental", from: "math.probability", to: "math.experimental_probability", type: "supports", weight: 0.7 },
    { id: "edge.math.algebra_to_inequality_extrema", from: "math.algebraic_expression", to: "math.advanced_inequality_extrema", type: "supports", weight: 0.7 },
    { id: "edge.math.grade9_to_exam10_synthesis", from: "math.quadratic_equation", to: "math.exam10_synthesis", type: "supports", weight: 0.6 },
    { id: "edge.obj.math_grade9_core_radicals", from: "obj.math.grade9.core", to: "math.simplify_radical_expression", type: "assesses", weight: 0.8 },
    { id: "edge.obj.math_vao10_core_synthesis", from: "obj.math.vao10.core", to: "math.thcs.grade9.exam10_synthesis", type: "supports", weight: 0.9 },
  ]);

  mergeProgramMap(graph, {
    programId: "vn_math_6",
    domainIds: ["mathematics"],
    conceptIds: ["math.natural_number_set", "math.divisibility_number_theory", "math.integer_number", "math.fraction_decimal", "math.percent_practical", "math.basic_geometry"],
    skillIds: ["math.work_with_sets_natural_numbers", "math.apply_divisibility_prime_gcd_lcm", "math.operate_integers", "math.operate_fractions_decimals_percent", "math.reason_basic_geometry"],
    objectiveIds: ["obj.math.grade6.core", "obj.math.grade6_8.number_foundation"],
    entryObjectiveIds: ["obj.math.grade6.core"],
    exitObjectiveIds: ["obj.math.grade6.core"],
  });
  mergeProgramMap(graph, {
    programId: "vn_math_7",
    domainIds: ["mathematics"],
    conceptIds: ["math.rational_real_number", "math.ratio_proportion", "math.linear_expression", "math.triangle_geometry", "math.statistics", "math.probability"],
    skillIds: ["math.operate_rational_numbers", "math.solve_ratio_problem", "math.manipulate_linear_expression", "math.reason_triangle_geometry", "math.interpret_charts", "math.compute_simple_probability"],
    objectiveIds: ["obj.math.grade7.core"],
    entryObjectiveIds: ["obj.math.grade7.core"],
    exitObjectiveIds: ["obj.math.grade7.core"],
  });
  mergeProgramMap(graph, {
    programId: "vn_math_8",
    domainIds: ["mathematics"],
    conceptIds: ["math.polynomial", "math.factorization", "math.algebraic_fraction", "math.linear_equation", "math.inequality", "math.triangle_quadrilateral_geometry", "math.similarity_thales"],
    skillIds: ["math.factor_polynomial", "math.factor_common_terms", "math.transform_algebraic_fraction", "math.solve_linear_equation", "math.solve_inequality", "math.reason_triangle_quadrilateral", "math.apply_similarity_thales"],
    objectiveIds: ["obj.math.grade8.core", "obj.math.grade6_8.algebra_foundation", "obj.math.grade6_8.geometry_foundation"],
    entryObjectiveIds: ["obj.math.grade8.core"],
    exitObjectiveIds: ["obj.math.grade8.core"],
  });
  mergeProgramMap(graph, {
    programId: "vn_math_9",
    domainIds: ["mathematics"],
    conceptIds: ["math.radicals_expression", "math.linear_system_two_variables", "math.quadratic_equation", "math.vieta", "math.functions_graphs", "math.linear_function", "math.quadratic_function_graph", "math.coordinate_geometry", "math.right_triangle_metric_relations", "math.circle_geometry", "math.inscribed_quadrilateral", "math.tangent_secant_geometry", "math.solid_cylinder_cone_sphere", "math.statistics_grouped_data", "math.probability"],
    skillIds: ["math.simplify_radical_expression", "math.evaluate_radical_expression", "math.solve_linear_system_two_variables", "math.solve_quadratic_by_factor", "math.apply_vieta", "math.analyze_function_graph", "math.analyze_linear_function", "math.analyze_parabola_line_intersection", "math.solve_coordinate_geometry_problem", "math.use_right_triangle_metric_relations", "math.use_circle_angle_metric_relations", "math.prove_inscribed_quadrilateral", "math.prove_tangent_secant_relations", "math.compute_cylinder_cone_sphere_measure", "math.interpret_grouped_frequency_table", "math.compute_simple_probability"],
    objectiveIds: ["obj.math.grade9.core", "obj.math.grade9.quadratic_foundation", "obj.math.grade9.miumath_pilot"],
    entryObjectiveIds: ["obj.math.grade9.core"],
    exitObjectiveIds: ["obj.math.grade9.core"],
  });
  mergeProgramMap(graph, {
    programId: "vn_math_vao_10",
    domainIds: ["mathematics"],
    conceptIds: ["math.exam10_synthesis", "math.radicals_expression", "math.irrational_equation", "math.advanced_inequality_extrema", "math.linear_system_two_variables", "math.quadratic_equation", "math.vieta", "math.quadratic_function_graph", "math.coordinate_geometry", "math.word_problem_modeling", "math.circle_geometry", "math.inscribed_quadrilateral", "math.tangent_secant_geometry", "math.trigonometry"],
    skillIds: ["math.simplify_radical_expression", "math.solve_irrational_equation", "math.solve_inequality_extrema_problem", "math.solve_linear_system_two_variables", "math.solve_quadratic_by_factor", "math.apply_vieta", "math.analyze_parabola_line_intersection", "math.solve_coordinate_geometry_problem", "math.model_word_problem", "math.prove_inscribed_quadrilateral", "math.prove_tangent_secant_relations", "math.model_height_distance_trig"],
    objectiveIds: ["obj.math.vao10.core", "obj.math.grade9.core", "obj.math.grade9.miumath_pilot"],
    entryObjectiveIds: ["obj.math.grade9.core"],
    exitObjectiveIds: ["obj.math.vao10.core"],
  });
  mergeProgramMap(graph, {
    programId: "vn_math_thcs",
    domainIds: ["mathematics"],
    conceptIds: [
      "math.natural_number_set",
      "math.divisibility_number_theory",
      "math.integer_number",
      "math.fraction_decimal",
      "math.rational_real_number",
      "math.ratio_proportion",
      "math.percent_practical",
      "math.basic_geometry",
      "math.triangle_geometry",
      "math.triangle_quadrilateral_geometry",
      "math.similarity_thales",
      "math.linear_expression",
      "math.inequality",
      "math.polynomial",
      "math.factorization",
      "math.algebraic_fraction",
      "math.radicals_expression",
      "math.linear_equation",
      "math.linear_system_two_variables",
      "math.quadratic_equation",
      "math.vieta",
      "math.functions_graphs",
      "math.linear_function",
      "math.quadratic_function_graph",
      "math.coordinate_geometry",
      "math.word_problem_modeling",
      "math.right_triangle_metric_relations",
      "math.circle_geometry",
      "math.inscribed_quadrilateral",
      "math.tangent_secant_geometry",
      "math.spatial_geometry",
      "math.solid_cylinder_cone_sphere",
      "math.statistics",
      "math.statistics_grouped_data",
      "math.probability",
      "math.experimental_probability",
      "math.advanced_inequality_extrema",
      "math.exam10_synthesis",
    ],
    skillIds: [
      "math.work_with_sets_natural_numbers",
      "math.apply_divisibility_prime_gcd_lcm",
      "math.operate_integers",
      "math.operate_fractions_decimals_percent",
      "math.operate_rational_numbers",
      "math.solve_ratio_problem",
      "math.reason_basic_geometry",
      "math.reason_triangle_geometry",
      "math.reason_triangle_quadrilateral",
      "math.apply_similarity_thales",
      "math.manipulate_linear_expression",
      "math.solve_inequality",
      "math.factor_polynomial",
      "math.factor_common_terms",
      "math.transform_algebraic_fraction",
      "math.simplify_radical_expression",
      "math.solve_linear_equation",
      "math.solve_linear_system_two_variables",
      "math.solve_quadratic_by_factor",
      "math.apply_vieta",
      "math.analyze_function_graph",
      "math.analyze_linear_function",
      "math.analyze_parabola_line_intersection",
      "math.solve_coordinate_geometry_problem",
      "math.model_word_problem",
      "math.use_right_triangle_metric_relations",
      "math.use_circle_angle_metric_relations",
      "math.prove_inscribed_quadrilateral",
      "math.prove_tangent_secant_relations",
      "math.compute_cylinder_cone_sphere_measure",
      "math.interpret_statistics",
      "math.interpret_grouped_frequency_table",
      "math.compute_probability",
      "math.compute_simple_probability",
      "math.estimate_experimental_probability",
      "math.solve_inequality_extrema_problem",
    ],
    objectiveIds: ["obj.math.grade6.core", "obj.math.grade7.core", "obj.math.grade8.core", "obj.math.grade9.core", "obj.math.vao10.core"],
    entryObjectiveIds: ["obj.math.grade6.core"],
    exitObjectiveIds: ["obj.math.vao10.core"],
  });

  ["vn_math_6_8", "vn_math_6_9"].forEach((programId) => {
    mergeProgramMap(graph, {
      programId,
      domainIds: ["mathematics"],
      conceptIds: ["math.natural_number_set", "math.divisibility_number_theory", "math.rational_real_number", "math.percent_practical", "math.triangle_geometry", "math.triangle_quadrilateral_geometry", "math.similarity_thales", "math.algebraic_fraction"],
      skillIds: ["math.work_with_sets_natural_numbers", "math.apply_divisibility_prime_gcd_lcm", "math.operate_integers", "math.operate_fractions_decimals_percent", "math.reason_triangle_geometry", "math.reason_triangle_quadrilateral", "math.apply_similarity_thales", "math.transform_algebraic_fraction"],
      objectiveIds: ["obj.math.grade6.core", "obj.math.grade7.core", "obj.math.grade8.core"],
    });
  });
  mergeProgramMap(graph, {
    programId: "vn_math_6_9",
    domainIds: ["mathematics"],
    conceptIds: ["math.radicals_expression", "math.linear_system_two_variables", "math.irrational_equation", "math.linear_function", "math.quadratic_function_graph", "math.coordinate_geometry", "math.right_triangle_metric_relations", "math.circle_geometry", "math.inscribed_quadrilateral", "math.tangent_secant_geometry", "math.solid_cylinder_cone_sphere", "math.statistics_grouped_data", "math.experimental_probability", "math.advanced_inequality_extrema", "math.exam10_synthesis"],
    skillIds: ["math.simplify_radical_expression", "math.evaluate_radical_expression", "math.solve_linear_system_two_variables", "math.solve_irrational_equation", "math.analyze_linear_function", "math.analyze_parabola_line_intersection", "math.solve_coordinate_geometry_problem", "math.use_right_triangle_metric_relations", "math.model_height_distance_trig", "math.use_circle_angle_metric_relations", "math.prove_inscribed_quadrilateral", "math.prove_tangent_secant_relations", "math.compute_cylinder_cone_sphere_measure", "math.interpret_grouped_frequency_table", "math.compute_simple_probability", "math.estimate_experimental_probability", "math.solve_inequality_extrema_problem"],
    objectiveIds: ["obj.math.grade9.core", "obj.math.vao10.core"],
    exitObjectiveIds: ["obj.math.vao10.core"],
  });
}

function upsertById<T extends EntityWithId>(target: T[], items: T[]): void {
  const existingIds = new Set(target.map((item) => item.id));
  items.forEach((item) => {
    if (!existingIds.has(item.id)) {
      target.push(item);
      existingIds.add(item.id);
    }
  });
}

function mergeProgramMap(graph: KnowledgeGraph, patch: ProgramMap): void {
  const existing = graph.programMaps.find((programMap) => programMap.programId === patch.programId);
  if (!existing) {
    graph.programMaps.push({
      ...patch,
      domainIds: uniqueKnowledgeStrings(patch.domainIds),
      conceptIds: uniqueKnowledgeStrings(patch.conceptIds),
      skillIds: uniqueKnowledgeStrings(patch.skillIds),
      objectiveIds: uniqueKnowledgeStrings(patch.objectiveIds),
      entryObjectiveIds: patch.entryObjectiveIds ? uniqueKnowledgeStrings(patch.entryObjectiveIds) : undefined,
      exitObjectiveIds: patch.exitObjectiveIds ? uniqueKnowledgeStrings(patch.exitObjectiveIds) : undefined,
    });
    return;
  }

  existing.domainIds = uniqueKnowledgeStrings([...existing.domainIds, ...patch.domainIds]);
  existing.conceptIds = uniqueKnowledgeStrings([...existing.conceptIds, ...patch.conceptIds]);
  existing.skillIds = uniqueKnowledgeStrings([...existing.skillIds, ...patch.skillIds]);
  existing.objectiveIds = uniqueKnowledgeStrings([...existing.objectiveIds, ...patch.objectiveIds]);
  existing.entryObjectiveIds = uniqueKnowledgeStrings([...(existing.entryObjectiveIds || []), ...(patch.entryObjectiveIds || [])]);
  existing.exitObjectiveIds = uniqueKnowledgeStrings([...(existing.exitObjectiveIds || []), ...(patch.exitObjectiveIds || [])]);
}

function uniqueKnowledgeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function mapById<T extends EntityWithId>(items: T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of Array.isArray(items) ? items : []) {
    if (item && item.id) result.set(item.id, item);
  }
  return result;
}

function appendToMap<T>(map: Map<string, T[]>, key: string, value: T): void {
  map.set(key, [...(map.get(key) || []), value]);
}

function buildGraphBackendStats(graph: KnowledgeGraph): GraphBackendEvaluationReport["stats"] {
  const domains = graph.domains.length;
  const programs = graph.programs.length;
  const concepts = graph.concepts.length;
  const skills = graph.skills.length;
  const objectives = graph.objectives.length;
  const misconceptions = graph.misconceptions.length;
  const lessonTemplates = (graph.lessonTemplates || []).length;
  const crossDomainPrograms = graph.programs.filter((program) => uniqueKnowledgeStrings(program.domainIds || []).length > 1).length;
  return {
    nodes: domains + programs + concepts + skills + objectives + misconceptions + lessonTemplates,
    domains,
    programs,
    concepts,
    skills,
    objectives,
    misconceptions,
    lessonTemplates,
    edges: graph.edges.length,
    crossDomainPrograms,
  };
}

function benchmarkPrerequisiteQueries(graph: KnowledgeGraph, nodeIds?: string[]): GraphBackendEvaluationReport["benchmark"] {
  const benchmarkIds = uniqueKnowledgeStrings(
    (nodeIds && nodeIds.length ? nodeIds : defaultBenchmarkNodeIds(graph)).filter((nodeId) => Boolean(nodeId)),
  );
  const start = Date.now();
  const rows = benchmarkIds.map((nodeId) => {
    const queryStart = Date.now();
    const closure = prerequisiteClosure(graph, nodeId);
    const elapsedMs = Date.now() - queryStart;
    return {
      nodeId,
      elapsedMs,
      closureSize: closure.length,
      depth: prerequisiteDepth(graph, nodeId),
    };
  });
  const elapsedMs = Date.now() - start;
  const closureSizes = rows.map((row) => row.closureSize);
  const queryTimes = rows.map((row) => row.elapsedMs);
  return {
    queries: rows.length,
    elapsedMs,
    maxQueryMs: queryTimes.length ? Math.max(...queryTimes) : 0,
    averageQueryMs: averageNumbers(queryTimes),
    maxClosureSize: closureSizes.length ? Math.max(...closureSizes) : 0,
    averageClosureSize: averageNumbers(closureSizes),
    maxPrerequisiteDepth: rows.length ? Math.max(...rows.map((row) => row.depth)) : 0,
  };
}

function defaultBenchmarkNodeIds(graph: KnowledgeGraph): string[] {
  return uniqueKnowledgeStrings([
    ...graph.programMaps.flatMap((programMap) => [
      ...(programMap.exitObjectiveIds || []),
      ...(programMap.objectiveIds || []).slice(-2),
      ...(programMap.skillIds || []).slice(-2),
    ]),
    ...graph.concepts.slice(-8).map((concept) => concept.id),
    ...graph.skills.slice(-8).map((skill) => skill.id),
  ]).slice(0, 96);
}

function prerequisiteDepth(graph: KnowledgeGraph, nodeId: string): number {
  const index = buildKnowledgeIndex(graph);
  const visited = new Set<string>();
  const stack = (index.edgesByTo.get(nodeId) || [])
    .filter((edge) => edge.type === "prerequisite")
    .map((edge) => ({ id: edge.from, depth: 1 }));
  let maxDepth = 0;

  while (stack.length) {
    const current = stack.pop();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    maxDepth = Math.max(maxDepth, current.depth);
    stack.push(
      ...(index.edgesByTo.get(current.id) || [])
        .filter((edge) => edge.type === "prerequisite")
        .map((edge) => ({ id: edge.from, depth: current.depth + 1 })),
    );
  }

  return maxDepth;
}

function positiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function averageNumbers(values: number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) return 0;
  return roundNumber(finite.reduce((sum, value) => sum + value, 0) / finite.length);
}

function roundNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

function validateUniqueIds(path: string, items: EntityWithId[], errors: KnowledgeIssue[]): void {
  if (!Array.isArray(items)) {
    errors.push({ code: "invalid_collection", path, message: `${path} must be an array.` });
    return;
  }
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ code: "invalid_item", path: `${path}[${index}]`, message: "Item must be an object." });
      return;
    }
    if (!item.id) {
      errors.push({ code: "missing_id", path: `${path}[${index}].id`, message: "Item id is required." });
      return;
    }
    if (seen.has(item.id)) {
      errors.push({ code: "duplicate_id", path: `${path}[${index}].id`, message: `Duplicate id: ${item.id}.` });
    }
    seen.add(item.id);
  });
}

function requireText(value: string, path: string, errors: KnowledgeIssue[]): void {
  if (!String(value || "").trim()) {
    errors.push({ code: "missing_text", path, message: "Required text value is missing." });
  }
}

function requireRef<T>(id: string, map: Map<string, T>, path: string, code: string, errors: KnowledgeIssue[]): void {
  if (!String(id || "").trim() || !map.has(id)) {
    errors.push({ code, path, message: `Unknown reference: ${id}.` });
  }
}

function requireRefs<T>(ids: string[], map: Map<string, T>, path: string, code: string, errors: KnowledgeIssue[]): void {
  if (!Array.isArray(ids)) {
    errors.push({ code: "invalid_refs", path, message: "Reference list must be an array." });
    return;
  }
  ids.forEach((id, index) => requireRef(id, map, `${path}[${index}]`, code, errors));
}

function requireNonEmptyRefs<T>(ids: string[], map: Map<string, T>, path: string, code: string, errors: KnowledgeIssue[]): void {
  if (!Array.isArray(ids) || ids.length === 0) {
    errors.push({ code: "empty_refs", path, message: "Reference list must contain at least one id." });
    return;
  }
  requireRefs(ids, map, path, code, errors);
}
