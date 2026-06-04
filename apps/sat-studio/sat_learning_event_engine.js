(function initSatStudioLearningEventEngine(root, factory) {
  const learningEventEngine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = learningEventEngine;
  }
  if (root) {
    root.SatStudioLearningEventEngine = learningEventEngine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioLearningEventEngine() {
  const EVENT_SCHEMA_VERSION = "learning_event_v1";
  const DEFAULT_LIMIT = 500;

  function stableChecksum(value = "") {
    const text = String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function normalizeEventType(value = "") {
    const type = String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
    return type || "learning_update";
  }

  function buildIdempotencyKey(event = {}) {
    const base = [
      event.accountId || "",
      event.type || "",
      event.entityType || "",
      event.entityId || "",
      event.occurredAt || "",
      JSON.stringify(event.payload || {}),
    ].join("|");
    return `le-${stableChecksum(base)}`;
  }

  function buildLearningEvent(type = "learning_update", payload = {}, context = {}) {
    const occurredAt = context.occurredAt || new Date().toISOString();
    const event = {
      schemaVersion: EVENT_SCHEMA_VERSION,
      id: context.id || "",
      type: normalizeEventType(type),
      accountId: context.accountId || "",
      entityType: context.entityType || payload.entityType || "",
      entityId: context.entityId || payload.entityId || payload.attemptId || payload.pretestId || payload.questionId || "",
      occurredAt,
      source: context.source || "sat_studio_client",
      payload: payload && typeof payload === "object" ? { ...payload } : {},
    };
    event.id = event.id || buildIdempotencyKey(event);
    return event;
  }

  function normalizeLearningEvents(events = []) {
    const seen = new Set();
    return (Array.isArray(events) ? events : [])
      .filter((event) => event && typeof event === "object")
      .map((event) => {
        const normalized = {
          schemaVersion: event.schemaVersion || EVENT_SCHEMA_VERSION,
          id: event.id || "",
          type: normalizeEventType(event.type),
          accountId: event.accountId || "",
          entityType: event.entityType || "",
          entityId: event.entityId || "",
          occurredAt: event.occurredAt || event.at || "",
          source: event.source || "sat_studio_client",
          payload: event.payload && typeof event.payload === "object" ? { ...event.payload } : {},
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

  function appendLearningEvent(profile = {}, event = {}, options = {}) {
    const limit = Math.max(50, Number(options.limit || DEFAULT_LIMIT));
    const events = normalizeLearningEvents([...(profile.learningEvents || []), event]);
    profile.learningEvents = events.slice(Math.max(0, events.length - limit));
    profile.learningEventRevision = stableChecksum(profile.learningEvents.map((item) => item.id).join("|"));
    profile.learningEventUpdatedAt = event.occurredAt || new Date().toISOString();
    return profile.learningEvents;
  }

  function summarizeLearningEvents(events = []) {
    const normalized = normalizeLearningEvents(events);
    const byType = normalized.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    return {
      schemaVersion: EVENT_SCHEMA_VERSION,
      total: normalized.length,
      byType,
      firstAt: normalized[0]?.occurredAt || "",
      lastAt: normalized[normalized.length - 1]?.occurredAt || "",
      revision: stableChecksum(normalized.map((event) => event.id).join("|")),
    };
  }

  return {
    EVENT_SCHEMA_VERSION,
    appendLearningEvent,
    buildLearningEvent,
    buildIdempotencyKey,
    normalizeLearningEvents,
    summarizeLearningEvents,
  };
});
