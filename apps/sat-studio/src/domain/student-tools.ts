import {
  ensureAccountProfile,
  loadAccountState,
  saveAccountState,
  type AccountState,
  type SatAccount,
} from "./account-ops";
import { stableChecksum } from "./learning-events";
import { estimatedBand, masteryRows, type LearnerState, type QuestionRepository } from "./student-learning";

export interface LessonResource {
  label: string;
  url: string;
  kind: "official" | "concept" | "tool";
}

export interface LessonCard {
  key: string;
  title: string;
  section: string;
  domain: string;
  skill: string;
  level: "foundation" | "core" | "hard_transfer";
  reason: string;
  questionCount: number;
  hardCount: number;
  resources: LessonResource[];
}

export interface VocabEntry {
  id: string;
  word: string;
  partOfSpeech: string;
  category: string;
  definition: string;
  secondaryDefinition: string;
  example: string;
  trapNote: string;
}

export interface VocabQuizAttempt {
  id: string;
  vocabId: string;
  selectedDefinition: string;
  correct: boolean;
  attemptedAt: string;
}

export interface VocabModel {
  total: number;
  known: number;
  learning: number;
  accuracy: number;
  categories: string[];
  entries: VocabEntry[];
  current: VocabEntry | null;
  quizChoices: string[];
}

export interface OfficialExamLog {
  id: string;
  testDate: string;
  source: "Bluebook" | "Khan Academy" | "Practice Test" | "Other";
  totalScore: number;
  rwScore: number;
  mathScore: number;
  notes: string;
  createdAt: string;
}

export interface ExamReviewModel {
  logs: OfficialExamLog[];
  bestScore: number;
  latestScore: number;
  latestRw: number;
  latestMath: number;
  targetGap: number;
  trend: "no_data" | "up" | "flat" | "down";
  recommendation: string;
}

const RESOURCE_LINKS: LessonResource[] = [
  { label: "College Board SAT practice", url: "https://satsuite.collegeboard.org/sat/practice-preparation", kind: "official" },
  { label: "Bluebook practice tests", url: "https://bluebook.collegeboard.org/students/practice", kind: "official" },
  { label: "Desmos graphing calculator", url: "https://www.desmos.com/calculator", kind: "tool" },
];

export const DEFAULT_VOCAB_ENTRIES: VocabEntry[] = [
  {
    id: "vocab-substantiate",
    word: "substantiate",
    partOfSpeech: "verb",
    category: "Evidence",
    definition: "to support a claim with proof or evidence",
    secondaryDefinition: "to give concrete basis to an argument",
    example: "The new data substantiate the researcher's claim.",
    trapNote: "Do not treat it as merely repeating a claim; it requires evidence.",
  },
  {
    id: "vocab-mitigate",
    word: "mitigate",
    partOfSpeech: "verb",
    category: "Cause and effect",
    definition: "to make something less severe or less harmful",
    secondaryDefinition: "to reduce the force or impact of a problem",
    example: "The policy was designed to mitigate the effects of drought.",
    trapNote: "It does not mean eliminate completely.",
  },
  {
    id: "vocab-nuance",
    word: "nuance",
    partOfSpeech: "noun",
    category: "Precision",
    definition: "a subtle distinction in meaning, tone, or effect",
    secondaryDefinition: "a fine shade of difference",
    example: "The critic notices a nuance in the poet's final line.",
    trapNote: "SAT traps often replace nuanced with broad or extreme.",
  },
  {
    id: "vocab-corroborate",
    word: "corroborate",
    partOfSpeech: "verb",
    category: "Evidence",
    definition: "to confirm or support a statement with additional evidence",
    secondaryDefinition: "to strengthen a conclusion by independent support",
    example: "The letters corroborate the historian's interpretation.",
    trapNote: "Corroboration adds support; it does not introduce contradiction.",
  },
  {
    id: "vocab-ambivalent",
    word: "ambivalent",
    partOfSpeech: "adjective",
    category: "Attitude",
    definition: "having mixed or conflicting feelings",
    secondaryDefinition: "uncertain because of competing attitudes",
    example: "The author is ambivalent about the technology's long-term effects.",
    trapNote: "It is not the same as indifferent.",
  },
  {
    id: "vocab-pragmatic",
    word: "pragmatic",
    partOfSpeech: "adjective",
    category: "Attitude",
    definition: "focused on practical results rather than theory",
    secondaryDefinition: "guided by workable considerations",
    example: "The committee proposed a pragmatic compromise.",
    trapNote: "It does not mean careless or unprincipled.",
  },
  {
    id: "vocab-disparate",
    word: "disparate",
    partOfSpeech: "adjective",
    category: "Comparison",
    definition: "fundamentally different or distinct",
    secondaryDefinition: "not alike in kind or quality",
    example: "The study combines data from disparate fields.",
    trapNote: "It does not mean desperate.",
  },
  {
    id: "vocab-constrain",
    word: "constrain",
    partOfSpeech: "verb",
    category: "Cause and effect",
    definition: "to limit or restrict",
    secondaryDefinition: "to hold something within bounds",
    example: "Limited funding can constrain the scope of a project.",
    trapNote: "Constrain is about limits, not encouragement.",
  },
  {
    id: "vocab-underscore",
    word: "underscore",
    partOfSpeech: "verb",
    category: "Rhetorical function",
    definition: "to emphasize or make more apparent",
    secondaryDefinition: "to call attention to an important point",
    example: "The repeated image underscores the passage's central contrast.",
    trapNote: "In SAT usage, it usually means emphasize, not literally underline.",
  },
  {
    id: "vocab-proliferate",
    word: "proliferate",
    partOfSpeech: "verb",
    category: "Change",
    definition: "to increase rapidly in number",
    secondaryDefinition: "to spread or multiply quickly",
    example: "Online archives proliferated as scanning tools became cheaper.",
    trapNote: "It implies rapid growth, not simple existence.",
  },
  {
    id: "vocab-transient",
    word: "transient",
    partOfSpeech: "adjective",
    category: "Time",
    definition: "lasting only a short time",
    secondaryDefinition: "temporary rather than permanent",
    example: "The effect was transient and disappeared after one week.",
    trapNote: "It contrasts with durable or persistent.",
  },
  {
    id: "vocab-arbitrary",
    word: "arbitrary",
    partOfSpeech: "adjective",
    category: "Reasoning",
    definition: "based on personal choice or chance rather than a clear reason",
    secondaryDefinition: "not governed by a consistent principle",
    example: "The cutoff was arbitrary, so researchers revised it.",
    trapNote: "It does not mean strict; it means not well justified.",
  },
];

function keyFrom(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function activeStudentAccount(accountState: AccountState): SatAccount | null {
  const active = accountState.accounts.find((account) => account.id === accountState.activeAccountId && account.role === "student" && account.status === "active");
  return active || accountState.accounts.find((account) => account.id === "student-demo" && account.role === "student") || accountState.accounts.find((account) => account.role === "student") || null;
}

function levelFor(status = ""): LessonCard["level"] {
  if (status === "Repair" || status === "Collect evidence") return "foundation";
  if (status === "Hard proof") return "hard_transfer";
  return "core";
}

function lessonReason(status = "", questionCount = 0, hardCount = 0): string {
  if (status === "Repair") return "Recent evidence shows a repair loop is needed before adding volume.";
  if (status === "Hard proof") return "Core accuracy is forming; prove transfer with fresh hard items.";
  if (questionCount < 8) return "Thin evidence: use this lesson to build a cleaner baseline.";
  return `${questionCount} public-safe item(s), including ${hardCount} hard item(s), are available for routing.`;
}

export function buildLessonLibrary(repo: QuestionRepository | null, state: LearnerState, limit = 8): LessonCard[] {
  if (!repo) return [];
  const masteryBySkill = new Map(masteryRows(state).map((row) => [row.skill, row]));
  const bySkill = new Map<string, { section: string; domain: string; skill: string; count: number; hard: number }>();
  repo.items.forEach((item) => {
    const key = item.skill || "Unknown skill";
    const row = bySkill.get(key) || { section: item.section, domain: item.domain, skill: key, count: 0, hard: 0 };
    row.count += 1;
    if (item.difficulty === "Hard") row.hard += 1;
    bySkill.set(key, row);
  });
  return [...bySkill.values()]
    .map((row) => {
      const mastery = masteryBySkill.get(row.skill);
      const level = levelFor(mastery?.status);
      const resources = row.section === "Math" ? RESOURCE_LINKS : RESOURCE_LINKS.filter((resource) => resource.kind !== "tool");
      return {
        key: keyFrom([row.section, row.domain, row.skill]),
        title: row.skill,
        section: row.section,
        domain: row.domain,
        skill: row.skill,
        level,
        reason: lessonReason(mastery?.status, row.count, row.hard),
        questionCount: row.count,
        hardCount: row.hard,
        resources,
      } satisfies LessonCard;
    })
    .sort((a, b) => {
      const levelRank = { foundation: 0, hard_transfer: 1, core: 2 };
      return levelRank[a.level] - levelRank[b.level] || b.hardCount - a.hardCount || b.questionCount - a.questionCount || a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

export function normalizeKnownVocabIds(value: unknown): string[] {
  return [...new Set((Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean))];
}

export function normalizeVocabQuizAttempts(value: unknown): VocabQuizAttempt[] {
  return (Array.isArray(value) ? value : [])
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map((item) => ({
      id: String(item.id || ""),
      vocabId: String(item.vocabId || ""),
      selectedDefinition: String(item.selectedDefinition || ""),
      correct: Boolean(item.correct),
      attemptedAt: String(item.attemptedAt || ""),
    }))
    .filter((item) => item.id && item.vocabId);
}

export function buildVocabModel(
  state: LearnerState,
  options: { category?: string; query?: string; hideKnown?: boolean; entries?: VocabEntry[] } = {},
): VocabModel {
  const entries = options.entries || DEFAULT_VOCAB_ENTRIES;
  const known = new Set(normalizeKnownVocabIds(state.knownVocabIds));
  const query = String(options.query || "").trim().toLowerCase();
  const category = String(options.category || "All");
  const filtered = entries.filter((entry) => {
    if (options.hideKnown && known.has(entry.id)) return false;
    if (category !== "All" && entry.category !== category) return false;
    if (query && ![entry.word, entry.definition, entry.category, entry.example].join(" ").toLowerCase().includes(query)) return false;
    return true;
  });
  const attempts = normalizeVocabQuizAttempts(state.vocabQuizAttempts);
  const accuracy = attempts.length ? Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100) : 0;
  const current = filtered[0] || null;
  return {
    total: entries.length,
    known: known.size,
    learning: Math.max(0, entries.length - known.size),
    accuracy,
    categories: ["All", ...new Set(entries.map((entry) => entry.category))].sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b))),
    entries: filtered,
    current,
    quizChoices: current ? vocabQuizChoices(current, entries) : [],
  };
}

export function vocabQuizChoices(entry: VocabEntry, entries: VocabEntry[] = DEFAULT_VOCAB_ENTRIES): string[] {
  const distractors = entries.filter((item) => item.id !== entry.id).map((item) => item.definition).slice(0, 3);
  return [entry.definition, ...distractors].sort((a, b) => stableChecksum(`${entry.id}|${a}`).localeCompare(stableChecksum(`${entry.id}|${b}`)));
}

export function toggleVocabKnown(state: LearnerState, vocabId: string): LearnerState {
  const known = new Set(normalizeKnownVocabIds(state.knownVocabIds));
  if (known.has(vocabId)) known.delete(vocabId);
  else known.add(vocabId);
  return { ...state, knownVocabIds: [...known] };
}

export function recordVocabQuizAttempt(state: LearnerState, entry: VocabEntry, selectedDefinition: string): { state: LearnerState; attempt: VocabQuizAttempt } {
  const now = new Date().toISOString();
  const attempt = {
    id: `vocab-attempt-${stableChecksum([entry.id, selectedDefinition, now].join("|"))}`,
    vocabId: entry.id,
    selectedDefinition,
    correct: selectedDefinition === entry.definition,
    attemptedAt: now,
  };
  return {
    attempt,
    state: {
      ...state,
      vocabQuizAttempts: [...normalizeVocabQuizAttempts(state.vocabQuizAttempts), attempt] as unknown as Array<Record<string, unknown>>,
    },
  };
}

export function normalizeOfficialExamLogs(value: unknown): OfficialExamLog[] {
  return (Array.isArray(value) ? value : [])
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map((item) => {
      const totalScore = Math.max(400, Math.min(1600, Number(item.totalScore || item.score || 0)));
      return {
        id: String(item.id || ""),
        testDate: String(item.testDate || item.date || ""),
        source: (["Bluebook", "Khan Academy", "Practice Test", "Other"].includes(String(item.source)) ? String(item.source) : "Practice Test") as OfficialExamLog["source"],
        totalScore,
        rwScore: Math.max(200, Math.min(800, Number(item.rwScore || 0))),
        mathScore: Math.max(200, Math.min(800, Number(item.mathScore || 0))),
        notes: String(item.notes || ""),
        createdAt: String(item.createdAt || ""),
      };
    })
    .filter((item) => item.id && item.totalScore >= 400)
    .sort((a, b) => a.testDate.localeCompare(b.testDate) || a.createdAt.localeCompare(b.createdAt));
}

export function addOfficialExamLog(state: LearnerState, input: Partial<OfficialExamLog>): LearnerState {
  const now = new Date().toISOString();
  const rwScore = Math.max(200, Math.min(800, Number(input.rwScore || 0)));
  const mathScore = Math.max(200, Math.min(800, Number(input.mathScore || 0)));
  const totalScore = Math.max(400, Math.min(1600, Number(input.totalScore || rwScore + mathScore || 0)));
  const log: OfficialExamLog = {
    id: `official-${stableChecksum([input.testDate || "", input.source || "", totalScore, now].join("|"))}`,
    testDate: input.testDate || now.slice(0, 10),
    source: input.source || "Practice Test",
    totalScore,
    rwScore,
    mathScore,
    notes: input.notes || "",
    createdAt: now,
  };
  return { ...state, officialExamLogs: normalizeOfficialExamLogs([...state.officialExamLogs, log]) as unknown as Array<Record<string, unknown>> };
}

export function removeOfficialExamLog(state: LearnerState, logId: string): LearnerState {
  return { ...state, officialExamLogs: normalizeOfficialExamLogs(state.officialExamLogs).filter((log) => log.id !== logId) as unknown as Array<Record<string, unknown>> };
}

export function buildExamReviewModel(state: LearnerState): ExamReviewModel {
  const logs = normalizeOfficialExamLogs(state.officialExamLogs);
  const latest = logs[logs.length - 1] || null;
  const previous = logs[logs.length - 2] || null;
  const latestScore = latest?.totalScore || 0;
  const delta = latest && previous ? latest.totalScore - previous.totalScore : 0;
  const target = Number(state.targetScore || 1500);
  const band = estimatedBand(state);
  return {
    logs,
    bestScore: logs.reduce((max, log) => Math.max(max, log.totalScore), 0),
    latestScore,
    latestRw: latest?.rwScore || 0,
    latestMath: latest?.mathScore || 0,
    targetGap: latestScore ? Math.max(0, target - latestScore) : 0,
    trend: logs.length < 2 ? "no_data" : delta >= 30 ? "up" : delta <= -30 ? "down" : "flat",
    recommendation: latestScore
      ? latestScore < target
        ? `Current official gap is ${Math.max(0, target - latestScore)} point(s); use weak-skill proof before the next timed set.`
        : "Official score is at or above target; keep retention and hard transfer active."
      : `No official log yet. Local estimate is ${band}; add one Bluebook or official practice result to calibrate the roadmap.`,
  };
}

export function syncStudentToolsToAccountProfile(state: LearnerState, storage: Storage | null = globalThis.localStorage ?? null): AccountState | null {
  if (!storage) return null;
  const accountState = loadAccountState(storage);
  const account = activeStudentAccount(accountState);
  if (!account) return accountState;
  const profile = ensureAccountProfile(accountState.profiles, account.id);
  profile.officialLogs = normalizeOfficialExamLogs(state.officialExamLogs) as unknown as Array<Record<string, unknown>>;
  profile.vocabKnown = normalizeKnownVocabIds(state.knownVocabIds);
  profile.vocabQuizAttempts = normalizeVocabQuizAttempts(state.vocabQuizAttempts) as unknown as Array<Record<string, unknown>>;
  return saveAccountState(
    {
      ...accountState,
      activeAccountId: accountState.activeAccountId || account.id,
      profiles: { ...accountState.profiles, [account.id]: profile },
    },
    storage,
  );
}
