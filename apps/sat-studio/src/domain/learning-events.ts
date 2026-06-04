import {
  buildLearningEvent as buildSharedLearningEvent,
  saveLearningEventToStorage,
  saveLearningEventsToStorage,
  type LearningEventRecord as MiuprepLearningEventRecord,
  type LearningEventStorageLike,
} from "@miuprep/learning";

export const LEARNING_EVENT_SCHEMA_VERSION = "learning_event_v1";
export const ATTEMPT_SCHEMA_VERSION = "sat_attempt_v2";
export const DEFAULT_LEARNING_EVENT_LIMIT = 1000;

export type LearningEventType = "question_attempt" | "diagnostic_attempt" | "practice_attempt" | "review_attempt" | "learning_update";

export interface LearningEventRecord {
  schemaVersion: typeof LEARNING_EVENT_SCHEMA_VERSION;
  id: string;
  type: LearningEventType;
  accountId: string;
  entityType: string;
  entityId: string;
  occurredAt: string;
  source: "sat_studio_vite_student" | "sat_studio_client" | string;
  payload: Record<string, unknown>;
}

export interface LearningEventSummary {
  schemaVersion: typeof LEARNING_EVENT_SCHEMA_VERSION;
  total: number;
  byType: Record<string, number>;
  firstAt: string;
  lastAt: string;
  revision: string;
}

export type SharedLearningEventRecord = MiuprepLearningEventRecord;

const SHARED_LEARNING_EVENT_SOURCE = "sat_studio";

export function stableChecksum(value = ""): string {
  const text = String(value || "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function normalizeEventType(value = ""): LearningEventType {
  const type = String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (type === "question_attempt" || type === "diagnostic_attempt" || type === "practice_attempt" || type === "review_attempt") return type;
  return "learning_update";
}

export function buildIdempotencyKey(event: Partial<LearningEventRecord> = {}): string {
  const base = [event.accountId || "", event.type || "", event.entityType || "", event.entityId || "", event.occurredAt || "", JSON.stringify(event.payload || {})].join("|");
  return `le-${stableChecksum(base)}`;
}

export function buildLearningEvent(
  type: LearningEventType | string = "learning_update",
  payload: Record<string, unknown> = {},
  context: Partial<LearningEventRecord> = {},
): LearningEventRecord {
  const occurredAt = context.occurredAt || new Date().toISOString();
  const event: LearningEventRecord = {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    id: context.id || "",
    type: normalizeEventType(type),
    accountId: context.accountId || "",
    entityType: context.entityType || String(payload.entityType || ""),
    entityId: context.entityId || String(payload.entityId || payload.attemptId || payload.questionId || ""),
    occurredAt,
    source: context.source || "sat_studio_vite_student",
    payload: { ...payload },
  };
  event.id = event.id || buildIdempotencyKey(event);
  return event;
}

export function normalizeLearningEvents(events: unknown[] = []): LearningEventRecord[] {
  const seen = new Set<string>();
  return (Array.isArray(events) ? events : [])
    .filter((event): event is Record<string, unknown> => Boolean(event && typeof event === "object" && !Array.isArray(event)))
    .map((event) => {
      const normalized: LearningEventRecord = {
        schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
        id: String(event.id || ""),
        type: normalizeEventType(String(event.type || "")),
        accountId: String(event.accountId || ""),
        entityType: String(event.entityType || ""),
        entityId: String(event.entityId || ""),
        occurredAt: String(event.occurredAt || event.at || ""),
        source: String(event.source || "sat_studio_client"),
        payload: event.payload && typeof event.payload === "object" && !Array.isArray(event.payload) ? { ...(event.payload as Record<string, unknown>) } : {},
      };
      normalized.id = normalized.id || buildIdempotencyKey(normalized);
      return normalized;
    })
    .filter((event) => {
      if (!event.id || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => String(a.occurredAt || "").localeCompare(String(b.occurredAt || "")));
}

export function appendLearningEvent(events: unknown[] = [], event: LearningEventRecord, limit = DEFAULT_LEARNING_EVENT_LIMIT): LearningEventRecord[] {
  const cappedLimit = Math.max(50, Number(limit || DEFAULT_LEARNING_EVENT_LIMIT));
  const normalized = normalizeLearningEvents([...events, event]);
  return normalized.slice(Math.max(0, normalized.length - cappedLimit));
}

export function summarizeLearningEvents(events: unknown[] = []): LearningEventSummary {
  const normalized = normalizeLearningEvents(events);
  const byType = normalized.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  return {
    schemaVersion: LEARNING_EVENT_SCHEMA_VERSION,
    total: normalized.length,
    byType,
    firstAt: normalized[0]?.occurredAt || "",
    lastAt: normalized[normalized.length - 1]?.occurredAt || "",
    revision: stableChecksum(normalized.map((event) => event.id).join("|")),
  };
}

export function toSharedLearningEvent(event: LearningEventRecord): SharedLearningEventRecord {
  return buildSharedLearningEvent(
    sharedLearningEventType(event),
    {
      ...event.payload,
      programId: "sat",
      domainId: inferSharedDomainId(event),
      satAccountId: event.accountId,
      satSource: event.source,
    },
    {
      id: event.id,
      learnerId: event.accountId,
      entityType: event.entityType,
      entityId: event.entityId,
      occurredAt: event.occurredAt,
      source: SHARED_LEARNING_EVENT_SOURCE,
    },
  );
}

export function saveSharedLearningEvent(event: LearningEventRecord, storage?: LearningEventStorageLike | null): SharedLearningEventRecord | null {
  return saveLearningEventToStorage(event ? toSharedLearningEvent(event) : null, storage);
}

export function saveSharedLearningEvents(events: LearningEventRecord[], storage?: LearningEventStorageLike | null): SharedLearningEventRecord[] {
  return saveLearningEventsToStorage((Array.isArray(events) ? events : []).map(toSharedLearningEvent), storage);
}

function sharedLearningEventType(event: LearningEventRecord): LearningEventType {
  if (event.type === "learning_update" && String(event.payload?.mode || "") === "bluebook") return "practice_attempt";
  return event.type;
}

function inferSharedDomainId(event: LearningEventRecord): "mathematics" | "english_core" {
  const text = `${event.payload?.section || ""} ${event.payload?.domain || ""} ${event.payload?.skill || ""}`.toLowerCase();
  if (text.includes("math")) return "mathematics";
  return "english_core";
}
