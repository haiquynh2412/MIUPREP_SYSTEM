import assert from "node:assert/strict";
import { sharedLearningEventStorageKey, SHARED_LEARNING_EVENTS_LIST_KEY } from "@miuprep/learning";
import {
  appendLearningEvent,
  buildLearningEvent,
  buildIdempotencyKey,
  normalizeLearningEvents,
  saveSharedLearningEvent,
  summarizeLearningEvents,
  toSharedLearningEvent,
} from "./learning-events";

const event = buildLearningEvent(
  "practice_attempt",
  {
    attemptId: "a1",
    questionId: "q1",
    correct: false,
    skill: "Linear equations",
  },
  {
    accountId: "student-demo",
    entityType: "question",
    entityId: "q1",
    occurredAt: "2026-05-28T01:00:00.000Z",
  },
);

assert.equal(event.schemaVersion, "learning_event_v1");
assert.equal(event.type, "practice_attempt");
assert.equal(event.accountId, "student-demo");
assert.equal(event.entityId, "q1");
assert.equal(event.id, buildIdempotencyKey(event));

const duplicate = { ...event, payload: { ...event.payload } };
const later = buildLearningEvent("review_attempt", { attemptId: "a2", questionId: "q2", correct: true }, {
  accountId: "student-demo",
  entityType: "question",
  entityId: "q2",
  occurredAt: "2026-05-28T02:00:00.000Z",
});

const normalized = normalizeLearningEvents([later, event, duplicate, null]);
assert.deepEqual(normalized.map((row) => row.id), [event.id, later.id]);

const appended = appendLearningEvent([event], later, 50);
assert.equal(appended.length, 2);

const summary = summarizeLearningEvents(appended);
assert.equal(summary.total, 2);
assert.equal(summary.byType.practice_attempt, 1);
assert.equal(summary.byType.review_attempt, 1);
assert.equal(summary.firstAt, "2026-05-28T01:00:00.000Z");
assert.equal(summary.lastAt, "2026-05-28T02:00:00.000Z");
assert.ok(summary.revision.length >= 8);

const shared = toSharedLearningEvent(event);
assert.equal(shared.learnerId, "student-demo");
assert.equal(shared.source, "sat_studio");
assert.equal(shared.eventId, event.id);
assert.ok(shared.idempotencyKey);
assert.ok(shared.payloadHash);
assert.ok(shared.receivedAt);
assert.equal(shared.payload.programId, "sat");
assert.equal(shared.payload.satAccountId, "student-demo");

class MemoryStorage {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const storage = new MemoryStorage();
saveSharedLearningEvent(event, storage);
saveSharedLearningEvent(event, storage);
const sharedIds = JSON.parse(storage.getItem(SHARED_LEARNING_EVENTS_LIST_KEY) || "[]");
assert.deepEqual(sharedIds, [event.id]);
const storedShared = JSON.parse(storage.getItem(sharedLearningEventStorageKey(event.id)) || "{}");
assert.equal(storedShared.learnerId, "student-demo");
assert.equal(storedShared.payload.programId, "sat");

console.log("learning-events.test: pass");
