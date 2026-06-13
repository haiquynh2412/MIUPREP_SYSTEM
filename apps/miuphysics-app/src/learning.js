import { createSeedKnowledgeGraph } from '@miuprep/knowledge';
import {
  buildDiagnosticSet,
  buildReviewSet,
  buildErrorNotebookEntryFromAttempt,
  buildLearningPath,
  computeMastery,
  emptyStudentModel,
  getDueErrorNotebookEntries,
  normalizeErrorNotebookEntry,
  recommendNextAction,
  recordAttempt,
  saveLearningEventToStorage,
  saveLearningEventsToStorage,
  scheduleErrorNotebookReview,
  summarizeErrorNotebook,
} from '@miuprep/learning';

export const MIU_PHYSICS_PROGRAM_ID = 'vn_physics_6_7';
export const MIU_PHYSICS_DOMAIN_ID = 'physics';

const STORAGE_PREFIX = 'miu_physics_learning_state';
const ERROR_NOTEBOOK_PREFIX = 'miu_physics_error_notebook';
const SHARED_LEARNING_EVENT_SOURCE = 'miuphysics_app';

// Maps physics chapters to concept/skill/misconception IDs for the knowledge graph
const PHYSICS_CHAPTER_CONCEPT_MAP = {
  measurement: {
    conceptIds: ['physics.measurement', 'physics.units'],
    skillIds: ['physics.unit_conversion', 'physics.measuring_tools'],
    misconceptionIds: ['physics.confuse_mass_weight'],
  },
  mass_density: {
    conceptIds: ['physics.mass', 'physics.density', 'physics.volume'],
    skillIds: ['physics.density_calculation', 'physics.mass_measurement'],
    misconceptionIds: ['physics.confuse_mass_density', 'physics.density_units'],
  },
  force_basics: {
    conceptIds: ['physics.force', 'physics.gravity', 'physics.friction'],
    skillIds: ['physics.force_diagram', 'physics.net_force'],
    misconceptionIds: ['physics.force_velocity_confusion', 'physics.no_force_no_motion'],
  },
  motion_basics: {
    conceptIds: ['physics.motion', 'physics.speed', 'physics.velocity'],
    skillIds: ['physics.speed_calculation', 'physics.distance_time_graph'],
    misconceptionIds: ['physics.speed_velocity_confusion'],
  },
  energy_basics: {
    conceptIds: ['physics.energy', 'physics.kinetic_energy', 'physics.potential_energy'],
    skillIds: ['physics.energy_conservation', 'physics.energy_conversion'],
    misconceptionIds: ['physics.energy_destroyed', 'physics.confuse_energy_force'],
  },
  light_basics: {
    conceptIds: ['physics.light', 'physics.reflection', 'physics.refraction'],
    skillIds: ['physics.ray_diagram', 'physics.mirror_image'],
    misconceptionIds: ['physics.light_bends_wrong', 'physics.shadow_confusion'],
  },
  sound_basics: {
    conceptIds: ['physics.sound', 'physics.wave', 'physics.frequency'],
    skillIds: ['physics.sound_speed', 'physics.echo_calculation'],
    misconceptionIds: ['physics.sound_in_vacuum', 'physics.pitch_loudness_confusion'],
  },
  // Grade 7
  speed_graph: {
    conceptIds: ['physics.speed', 'physics.velocity', 'physics.motion'],
    skillIds: ['physics.speed_calculation', 'physics.distance_time_graph', 'physics.velocity_time_graph'],
    misconceptionIds: ['physics.speed_velocity_confusion', 'physics.graph_slope_confusion'],
  },
  reflection_refraction: {
    conceptIds: ['physics.reflection', 'physics.refraction', 'physics.light'],
    skillIds: ['physics.ray_diagram', 'physics.snell_law', 'physics.mirror_image'],
    misconceptionIds: ['physics.light_bends_wrong', 'physics.angle_of_incidence_confusion'],
  },
  sound_wave: {
    conceptIds: ['physics.sound', 'physics.wave', 'physics.frequency', 'physics.wavelength'],
    skillIds: ['physics.sound_speed', 'physics.wave_equation', 'physics.echo_calculation'],
    misconceptionIds: ['physics.sound_in_vacuum', 'physics.wave_particle_confusion'],
  },
  magnetic_field_basics: {
    conceptIds: ['physics.magnetism', 'physics.magnetic_field', 'physics.compass'],
    skillIds: ['physics.magnetic_field_lines', 'physics.electromagnet_basics'],
    misconceptionIds: ['physics.magnetic_electric_confusion', 'physics.magnet_pole_confusion'],
  },
  earth_solar_system: {
    conceptIds: ['physics.gravity', 'physics.solar_system', 'physics.earth_rotation'],
    skillIds: ['physics.orbital_period', 'physics.day_night_explanation'],
    misconceptionIds: ['physics.seasons_distance_confusion', 'physics.moon_phase_confusion'],
  },
  // Grade 8
  pressure: {
    conceptIds: ['physics.pressure', 'physics.force', 'physics.area'],
    skillIds: ['physics.pressure_calculation', 'physics.pressure_unit_conversion'],
    misconceptionIds: ['physics.pressure_force_confusion', 'physics.pressure_area_inverse'],
  },
  liquid_pressure: {
    conceptIds: ['physics.pressure', 'physics.liquid_pressure', 'physics.atmospheric_pressure'],
    skillIds: ['physics.hydrostatic_pressure', 'physics.pascal_law'],
    misconceptionIds: ['physics.pressure_depth_shape_confusion', 'physics.atmospheric_pressure_direction'],
  },
  buoyancy: {
    conceptIds: ['physics.buoyancy', 'physics.density', 'physics.archimedes_principle'],
    skillIds: ['physics.buoyant_force_calculation', 'physics.float_sink_prediction'],
    misconceptionIds: ['physics.buoyancy_weight_confusion', 'physics.heavy_objects_sink'],
  },
  moment_of_force: {
    conceptIds: ['physics.moment', 'physics.lever', 'physics.torque'],
    skillIds: ['physics.moment_calculation', 'physics.lever_balance'],
    misconceptionIds: ['physics.moment_force_confusion', 'physics.lever_arm_confusion'],
  },
  kinetic_energy: {
    conceptIds: ['physics.kinetic_energy', 'physics.mass', 'physics.velocity'],
    skillIds: ['physics.kinetic_energy_calculation', 'physics.work_energy_theorem'],
    misconceptionIds: ['physics.ke_velocity_linear', 'physics.confuse_energy_force'],
  },
  potential_energy: {
    conceptIds: ['physics.potential_energy', 'physics.gravity', 'physics.height'],
    skillIds: ['physics.gravitational_pe_calculation', 'physics.elastic_pe_basics'],
    misconceptionIds: ['physics.pe_only_gravity', 'physics.pe_reference_point'],
  },
  energy_conservation: {
    conceptIds: ['physics.energy', 'physics.kinetic_energy', 'physics.potential_energy', 'physics.energy_conservation'],
    skillIds: ['physics.energy_conservation', 'physics.energy_conversion', 'physics.energy_bar_chart'],
    misconceptionIds: ['physics.energy_destroyed', 'physics.perpetual_motion_possible'],
  },
  heat_transfer: {
    conceptIds: ['physics.heat', 'physics.conduction', 'physics.convection', 'physics.radiation'],
    skillIds: ['physics.heat_calculation', 'physics.specific_heat', 'physics.thermal_equilibrium'],
    misconceptionIds: ['physics.cold_transfers', 'physics.heat_temperature_same'],
  },
  // Grade 9
  resistance_ohm: {
    conceptIds: ['physics.resistance', 'physics.ohm_law', 'physics.current', 'physics.voltage'],
    skillIds: ['physics.ohm_law_calculation', 'physics.resistance_calculation', 'physics.vi_graph'],
    misconceptionIds: ['physics.current_consumed', 'physics.voltage_current_same'],
  },
  electric_circuit: {
    conceptIds: ['physics.circuit', 'physics.series_circuit', 'physics.parallel_circuit'],
    skillIds: ['physics.circuit_analysis', 'physics.equivalent_resistance', 'physics.kirchhoff_basics'],
    misconceptionIds: ['physics.current_used_up', 'physics.series_parallel_confusion'],
  },
  electric_power: {
    conceptIds: ['physics.electric_power', 'physics.energy', 'physics.current', 'physics.voltage'],
    skillIds: ['physics.power_calculation', 'physics.energy_cost_calculation'],
    misconceptionIds: ['physics.power_energy_same', 'physics.watt_kwh_confusion'],
  },
  magnetic_force: {
    conceptIds: ['physics.magnetic_force', 'physics.electromagnetic_induction', 'physics.motor_effect'],
    skillIds: ['physics.force_on_conductor', 'physics.faraday_law_basics', 'physics.left_hand_rule'],
    misconceptionIds: ['physics.magnetic_electric_confusion', 'physics.induction_static_confusion'],
  },
  light_spectrum: {
    conceptIds: ['physics.light', 'physics.spectrum', 'physics.dispersion', 'physics.electromagnetic_spectrum'],
    skillIds: ['physics.spectrum_order', 'physics.wavelength_frequency_relation'],
    misconceptionIds: ['physics.white_light_colorless', 'physics.uv_ir_confusion'],
  },
  nuclear_energy_intro: {
    conceptIds: ['physics.nuclear_energy', 'physics.radioactivity', 'physics.fission', 'physics.fusion'],
    skillIds: ['physics.mass_energy_equivalence', 'physics.half_life_basics'],
    misconceptionIds: ['physics.radiation_always_harmful', 'physics.fission_fusion_same'],
  },
};

export const learningStorageKey = (learnerId) => `${STORAGE_PREFIX}_${learnerId || 'guest'}`;
export const errorNotebookStorageKey = (learnerId) => `${ERROR_NOTEBOOK_PREFIX}_${learnerId || 'guest'}`;

export function loadMiuPhysicsLearningState(learnerId = 'guest') {
  const base = emptyStudentModel(learnerId, [MIU_PHYSICS_PROGRAM_ID]);
  try {
    const stored = localStorage.getItem(learningStorageKey(learnerId));
    if (!stored) return base;
    const parsed = JSON.parse(stored);
    return {
      ...base,
      ...parsed,
      learnerId,
      targetProgramIds:
        Array.isArray(parsed?.targetProgramIds) && parsed.targetProgramIds.length
          ? parsed.targetProgramIds
          : [MIU_PHYSICS_PROGRAM_ID],
      attempts: Array.isArray(parsed?.attempts) ? parsed.attempts : [],
      learningEvents: Array.isArray(parsed?.learningEvents) ? parsed.learningEvents : [],
      updatedAt: parsed?.updatedAt || base.updatedAt,
    };
  } catch {
    return base;
  }
}

export function saveMiuPhysicsLearningState(learnerId, state) {
  localStorage.setItem(learningStorageKey(learnerId), JSON.stringify(state));
}

export function saveMiuPhysicsSharedLearningEvent(event) {
  return saveLearningEventToStorage(prepareMiuPhysicsSharedLearningEvent(event));
}

export function saveMiuPhysicsSharedLearningEvents(events) {
  return saveLearningEventsToStorage(
    (Array.isArray(events) ? events : []).map(prepareMiuPhysicsSharedLearningEvent).filter(Boolean),
  );
}

export function loadMiuPhysicsErrorNotebook(learnerId = 'guest') {
  try {
    const stored = localStorage.getItem(errorNotebookStorageKey(learnerId));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeErrorNotebookEntry) : [];
  } catch {
    return [];
  }
}

export function saveMiuPhysicsErrorNotebook(learnerId, entries) {
  const normalized = (Array.isArray(entries) ? entries : []).map(normalizeErrorNotebookEntry);
  localStorage.setItem(errorNotebookStorageKey(learnerId), JSON.stringify(normalized));
  return normalized;
}

function toPhysicsQuestionItem(q) {
  const chapterMap = PHYSICS_CHAPTER_CONCEPT_MAP[q.chapter] || {};
  return {
    id: `miuphysics.${q.id}`,
    sourceId: q.id,
    source: 'miuphysics',
    domainId: MIU_PHYSICS_DOMAIN_ID,
    programIds: [MIU_PHYSICS_PROGRAM_ID],
    conceptIds: chapterMap.conceptIds || [],
    skillIds: chapterMap.skillIds || [],
    misconceptionIds: chapterMap.misconceptionIds || [],
    type: q.type || 'multiple_choice',
    prompt: q.question_text || '',
    choices: q.options || [],
    correctAnswer: q.correct_answer || '',
    explanation: q.explanation || {},
    difficulty: q.difficulty || 'medium',
    cognitiveLevel: 'understand',
    tags: [q.chapter, q.topic, `grade${q.grade}`].filter(Boolean),
    metadata: { grade: q.grade, chapter: q.chapter, topic: q.topic },
  };
}

function toPhysicsQuestionItems(questions) {
  return (questions || []).map(toPhysicsQuestionItem);
}

export function recordMiuPhysicsAttempt(
  state,
  question,
  selectedAnswer,
  mode = 'practice',
  learnerId = state.learnerId || 'guest',
) {
  const answer = String(selectedAnswer || '').trim();
  if (!question || !answer) return null;

  const normalized = normalizeMiuPhysicsQuestion(question);
  const item = toPhysicsQuestionItem(normalized);
  const correct =
    answer.toLowerCase() ===
    String(question.correct_answer || '')
      .trim()
      .toLowerCase();
  return recordAttempt(
    {
      ...state,
      learnerId,
      targetProgramIds: state.targetProgramIds?.length ? state.targetProgramIds : [MIU_PHYSICS_PROGRAM_ID],
    },
    {
      learnerId,
      itemId: item.id,
      domainId: item.domainId,
      programId: MIU_PHYSICS_PROGRAM_ID,
      conceptIds: item.conceptIds,
      skillIds: item.skillIds,
      correct,
      difficulty: item.difficulty,
      mode,
      timeSpentSeconds: 0,
      errorCategories: correct ? ['none'] : inferErrorCategories(question),
      misconceptionIds: correct ? [] : item.misconceptionIds,
      payload: {
        source: 'miuphysics',
        sourceId: question.id,
        chapter: question.chapter || '',
        topic: question.topic || '',
        selectedAnswer: answer,
        correctAnswer: question.correct_answer || '',
      },
    },
  );
}

export function recordMiuPhysicsErrorNotebookMistake(learnerId, question, selectedAnswer, attempt, currentEntries) {
  if (!question || !attempt || attempt.correct) return { entries: loadMiuPhysicsErrorNotebook(learnerId), entry: null };

  const entry = buildErrorNotebookEntryFromAttempt(attempt, {
    questionType: question.type || question.chapter || 'physics_question',
    userAnswer: selectedAnswer || '',
    correctAnswer: question.correct_answer || '',
    explanation: formatMiuPhysicsExplanation(question),
  });
  if (!entry) return { entries: loadMiuPhysicsErrorNotebook(learnerId), entry: null };

  const entries = Array.isArray(currentEntries)
    ? currentEntries.map(normalizeErrorNotebookEntry)
    : loadMiuPhysicsErrorNotebook(learnerId);
  const existingIndex = entries.findIndex((item) => item.questionId === entry.questionId);
  const normalizedEntry = normalizeErrorNotebookEntry(entry);

  if (existingIndex >= 0) {
    entries[existingIndex] = {
      ...normalizedEntry,
      id: entries[existingIndex].id,
      createdAt: entries[existingIndex].createdAt,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: normalizedEntry.createdAt,
      updatedAt: normalizedEntry.createdAt,
    };
  } else {
    entries.push(normalizedEntry);
  }

  return { entries: saveMiuPhysicsErrorNotebook(learnerId, entries), entry: normalizedEntry };
}

export function reviewMiuPhysicsErrorNotebookEntry(learnerId, questionId, grade = 5, currentEntries) {
  const entries = Array.isArray(currentEntries)
    ? currentEntries.map(normalizeErrorNotebookEntry)
    : loadMiuPhysicsErrorNotebook(learnerId);
  const index = entries.findIndex(
    (entry) => entry.questionId === `miuphysics.${questionId}` || entry.questionId === questionId,
  );
  if (index < 0) return { entries, entry: null };

  const reviewed = scheduleErrorNotebookReview(entries[index], grade);
  entries[index] = reviewed;
  return { entries: saveMiuPhysicsErrorNotebook(learnerId, entries), entry: reviewed };
}

export function buildMiuPhysicsErrorNotebookSummary(entries, now = new Date().toISOString()) {
  return {
    ...summarizeErrorNotebook(entries || [], now),
    dueEntries: getDueErrorNotebookEntries(entries || [], now),
  };
}

export function buildMiuPhysicsLearningDashboard(state, questions) {
  const attempts = Array.isArray(state?.attempts) ? state.attempts : [];
  const items = toPhysicsQuestionItems((questions || []).map(normalizeMiuPhysicsQuestion));
  const mastery = computeMastery({ ...state, attempts });
  const skillMastery = mastery.filter((row) => row.scope === 'skill');
  const recommendation = recommendNextAction({ ...state, attempts }, { diagnosticMinAttempts: 8 });
  const reviewItems = buildReviewSet(items, attempts, 5);
  const diagnosticItems = buildDiagnosticSet(items, attempts, { limit: 5, programId: MIU_PHYSICS_PROGRAM_ID });
  const nextItem =
    recommendation.kind === 'review' ? reviewItems[0] || diagnosticItems[0] : diagnosticItems[0] || reviewItems[0];
  const nextQuestion = nextItem
    ? questions.find((question) => `miuphysics.${question.id}` === nextItem.id) || null
    : null;
  const learningPath = buildMiuPhysicsLearningPath(mastery, recommendation);

  return {
    attempts,
    mastery,
    skillMastery,
    recommendation,
    learningPath,
    nextQuestion,
    totalAttempts: attempts.length,
    stableSkills: skillMastery.filter((row) => row.status === 'stable').length,
    repairSkills: skillMastery.filter((row) => row.status === 'repair').length,
    collectEvidenceSkills: skillMastery.filter((row) => row.status === 'collect_evidence').length,
    topRows: skillMastery.slice(0, 6),
  };
}

export function buildMiuPhysicsDiagnosticQuestions(state, questions, limit = 10) {
  const attempts = Array.isArray(state?.attempts) ? state.attempts : [];
  const normalizedQuestions = (questions || []).map(normalizeMiuPhysicsQuestion);
  const items = toPhysicsQuestionItems(normalizedQuestions);
  const selectedItems = buildDiagnosticSet(items, attempts, { limit, programId: MIU_PHYSICS_PROGRAM_ID });
  const rawQuestionByItemId = new Map((questions || []).map((question) => [`miuphysics.${question.id}`, question]));
  return selectedItems.map((item) => rawQuestionByItemId.get(item.id)).filter(Boolean);
}

function buildMiuPhysicsLearningPath(mastery, recommendation) {
  const graph = createSeedKnowledgeGraph();
  const programMap = graph.programMaps.find((map) => map.programId === MIU_PHYSICS_PROGRAM_ID);
  const nodes = [
    ...graph.concepts
      .filter((concept) => concept.domainId === MIU_PHYSICS_DOMAIN_ID)
      .map((concept) => ({
        id: concept.id,
        domainId: concept.domainId,
        scope: 'concept',
        label: concept.name,
        programIds: programMap?.conceptIds?.includes(concept.id) ? [MIU_PHYSICS_PROGRAM_ID] : [],
      })),
    ...graph.skills
      .filter((skill) => skill.domainId === MIU_PHYSICS_DOMAIN_ID)
      .map((skill) => ({
        id: skill.id,
        domainId: skill.domainId,
        scope: 'skill',
        label: skill.name,
        programIds: programMap?.skillIds?.includes(skill.id) ? [MIU_PHYSICS_PROGRAM_ID] : [],
      })),
  ];
  const conceptToSkillEdges = graph.skills
    .filter((skill) => skill.domainId === MIU_PHYSICS_DOMAIN_ID)
    .flatMap((skill) =>
      (skill.conceptIds || []).map((conceptId) => ({
        id: `edge.${conceptId}_to_${skill.id}`,
        from: conceptId,
        to: skill.id,
        type: 'supports',
        weight: 0.75,
      })),
    );
  const targetIds = pickMiuPhysicsLearningTargetIds(recommendation, mastery, programMap);

  return buildLearningPath(mastery, nodes, [...(graph.edges || []), ...conceptToSkillEdges], {
    domainId: MIU_PHYSICS_DOMAIN_ID,
    targetIds,
    maxSteps: 7,
    includeSupportEdges: true,
  });
}

function pickMiuPhysicsLearningTargetIds(recommendation, mastery, programMap) {
  const recommended = uniqueStrings([...(recommendation?.conceptIds || []), ...(recommendation?.skillIds || [])]);
  if (recommended.length) return recommended;

  const weakRows = (mastery || [])
    .filter((row) => row.domainId === MIU_PHYSICS_DOMAIN_ID && row.status !== 'stable')
    .slice(0, 3)
    .map((row) => row.id);
  if (weakRows.length) return uniqueStrings(weakRows);

  const defaultTargets = ['physics.force', 'physics.energy', 'physics.motion'];
  const mappedTargets = defaultTargets.filter(
    (id) => programMap?.conceptIds?.includes(id) || programMap?.skillIds?.includes(id),
  );
  return mappedTargets.length ? mappedTargets : (programMap?.conceptIds || []).slice(0, 3);
}

function normalizeMiuPhysicsQuestion(question) {
  return {
    ...question,
    type: question.type || 'multiple_choice',
    difficulty: question.difficulty || 'medium',
    chapter: question.chapter || 'measurement',
    topic: question.topic || '',
    grade: question.grade || 6,
    question_text: question.question_text || '',
    options: Array.isArray(question.options) ? question.options : [],
    correct_answer: question.correct_answer || '',
    explanation: question.explanation || {},
  };
}

function inferErrorCategories(question) {
  const chapter = question.chapter || '';
  if (chapter === 'measurement') return ['unit_error'];
  if (chapter === 'mass_density') return ['calculation_error'];
  if (chapter === 'force_basics') return ['concept_confusion'];
  if (chapter === 'motion_basics') return ['concept_confusion'];
  if (chapter === 'energy_basics') return ['concept_confusion'];
  if (chapter === 'light_basics') return ['concept_confusion'];
  if (chapter === 'sound_basics') return ['concept_confusion'];
  // Grade 7
  if (chapter === 'speed_graph') return ['graph_reading_error', 'calculation_error'];
  if (chapter === 'reflection_refraction') return ['concept_confusion', 'diagram_error'];
  if (chapter === 'sound_wave') return ['concept_confusion'];
  if (chapter === 'magnetic_field_basics') return ['concept_confusion'];
  if (chapter === 'earth_solar_system') return ['concept_confusion'];
  // Grade 8
  if (chapter === 'pressure') return ['calculation_error', 'unit_error'];
  if (chapter === 'liquid_pressure') return ['calculation_error', 'concept_confusion'];
  if (chapter === 'buoyancy') return ['calculation_error', 'concept_confusion'];
  if (chapter === 'moment_of_force') return ['calculation_error'];
  if (chapter === 'kinetic_energy') return ['calculation_error'];
  if (chapter === 'potential_energy') return ['calculation_error'];
  if (chapter === 'energy_conservation') return ['concept_confusion', 'calculation_error'];
  if (chapter === 'heat_transfer') return ['concept_confusion'];
  // Grade 9
  if (chapter === 'resistance_ohm') return ['calculation_error', 'formula_error'];
  if (chapter === 'electric_circuit') return ['circuit_analysis_error', 'calculation_error'];
  if (chapter === 'electric_power') return ['calculation_error', 'unit_error'];
  if (chapter === 'magnetic_force') return ['concept_confusion'];
  if (chapter === 'light_spectrum') return ['concept_confusion'];
  if (chapter === 'nuclear_energy_intro') return ['concept_confusion'];
  return ['unknown'];
}

function formatMiuPhysicsExplanation(question) {
  const explanation = question?.explanation || {};
  const parts = [explanation.thinking, explanation.steps, explanation.traps, explanation.formula].filter(Boolean);
  return parts.join('\n\n') || question?.question_text || '';
}

function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function prepareMiuPhysicsSharedLearningEvent(event) {
  if (!event) return null;
  return {
    ...event,
    source: SHARED_LEARNING_EVENT_SOURCE,
    payload: {
      ...(event.payload || {}),
      domainId: MIU_PHYSICS_DOMAIN_ID,
      programId: MIU_PHYSICS_PROGRAM_ID,
    },
  };
}

// ---- Streak Tracking ----
const STREAK_STORAGE_KEY = 'miu_physics_streak';

export function loadStreak() {
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!stored) return { current: 0, best: 0, lastDate: null };
    return JSON.parse(stored);
  } catch {
    return { current: 0, best: 0, lastDate: null };
  }
}

export function updateStreak() {
  const streak = loadStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastDate === today) return streak; // Already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newCurrent;

  if (streak.lastDate === yesterday) {
    newCurrent = streak.current + 1;
  } else {
    newCurrent = 1; // Reset streak
  }

  const newStreak = {
    current: newCurrent,
    best: Math.max(newCurrent, streak.best),
    lastDate: today,
  };

  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
  return newStreak;
}

// ---- XP & Achievement Tracking ----
const XP_STORAGE_KEY = 'miu_physics_xp';
const ACHIEVEMENTS_STORAGE_KEY = 'miu_physics_achievements';

export function loadXp() {
  try {
    const stored = localStorage.getItem(XP_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function addXp(amount) {
  const current = loadXp();
  const next = current + amount;
  localStorage.setItem(XP_STORAGE_KEY, String(next));
  return next;
}

export function loadUnlockedAchievements() {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function unlockAchievement(achievementId) {
  const unlocked = loadUnlockedAchievements();
  if (unlocked.includes(achievementId)) return { unlocked, isNew: false };
  unlocked.push(achievementId);
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocked));
  return { unlocked, isNew: true };
}

export function checkAndUnlockAchievements(state, streak) {
  const unlocked = loadUnlockedAchievements();
  const attempts = state?.attempts || [];
  const newlyUnlocked = [];

  const tryUnlock = (id) => {
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      newlyUnlocked.push(id);
    }
  };

  // First correct answer
  if (attempts.some((a) => a.correct)) tryUnlock('ach_first_correct');

  // Correct count milestones
  const correctCount = attempts.filter((a) => a.correct).length;
  if (correctCount >= 10) tryUnlock('ach_correct_10');
  if (correctCount >= 50) tryUnlock('ach_correct_50');
  if (correctCount >= 100) tryUnlock('ach_correct_100');

  // Streak milestones
  if (streak?.current >= 3) tryUnlock('ach_streak_3');
  if (streak?.current >= 7) tryUnlock('ach_streak_7');
  if (streak?.current >= 30) tryUnlock('ach_streak_30');

  // Perfect score on any chapter (all correct)
  const chapterAttempts = {};
  attempts.forEach((a) => {
    const ch = a.payload?.chapter;
    if (ch) {
      if (!chapterAttempts[ch]) chapterAttempts[ch] = { total: 0, correct: 0 };
      chapterAttempts[ch].total++;
      if (a.correct) chapterAttempts[ch].correct++;
    }
  });

  Object.entries(chapterAttempts).forEach(([ch, stats]) => {
    if (stats.total >= 5 && stats.correct / stats.total >= 0.8) {
      tryUnlock(`ach_master_${ch}`);
    }
  });

  // Consecutive correct answers
  let maxConsecutive = 0,
    currentConsecutive = 0;
  attempts.forEach((a) => {
    if (a.correct) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  });
  if (maxConsecutive >= 5) tryUnlock('ach_consecutive_5');
  if (maxConsecutive >= 10) tryUnlock('ach_consecutive_10');

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocked));
  }

  return { unlocked, newlyUnlocked };
}

// ---- Observation Diary ----
const DIARY_STORAGE_KEY = 'miu_physics_diary';

export function loadDiaryEntries() {
  try {
    const stored = localStorage.getItem(DIARY_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addDiaryEntry(entry) {
  const entries = loadDiaryEntries();
  const newEntry = {
    id: `diary_${Date.now()}`,
    date: new Date().toISOString(),
    ...entry,
  };
  entries.unshift(newEntry);
  localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  return { entries, newEntry };
}

export function deleteDiaryEntry(entryId) {
  let entries = loadDiaryEntries();
  entries = entries.filter((e) => e.id !== entryId);
  localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

// ---- Detective Mission Tracking ----
const MISSIONS_STORAGE_KEY = 'miu_physics_completed_missions';

export function loadCompletedMissions() {
  try {
    const stored = localStorage.getItem(MISSIONS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function completeMission(missionId) {
  const completed = loadCompletedMissions();
  if (!completed.includes(missionId)) {
    completed.push(missionId);
    localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(completed));
  }
  return completed;
}

// ---- Completed Home Experiments ----
const EXPERIMENTS_STORAGE_KEY = 'miu_physics_completed_experiments';

export function loadCompletedExperiments() {
  try {
    const stored = localStorage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function completeExperiment(experimentId) {
  const completed = loadCompletedExperiments();
  if (!completed.includes(experimentId)) {
    completed.push(experimentId);
    localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(completed));
  }
  return completed;
}
