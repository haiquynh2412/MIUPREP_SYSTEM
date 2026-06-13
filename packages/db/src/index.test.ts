function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const Module = require('module');
const originalLoad = Module._load;
Module._load = function patchedLoad(request: string, parent: unknown, isMain: boolean) {
  if (request === '@miuprep/content') {
    return {
      validateIeltsTest: () => [],
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const {
  buildLearningEvent,
  sharedLearningEventStorageKey,
  SHARED_LEARNING_EVENTS_LIST_KEY,
} = require('@miuprep/learning');
const { LocalStorageAdapter } = require('./index');

class MemoryStorage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] || null;
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key) || '' : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

const storage = new MemoryStorage();
(globalThis as any).localStorage = storage;
(globalThis as any).window = { localStorage: storage };

const db = new LocalStorageAdapter();

const first = buildLearningEvent(
  'diagnostic_attempt',
  { programId: 'vn_math_6_9', itemId: 'math-q1' },
  {
    learnerId: 'learner-a',
    entityType: 'question',
    entityId: 'math-q1',
    occurredAt: '2026-06-02T08:00:00.000Z',
    source: 'db_test',
  },
);
const second = buildLearningEvent(
  'practice_attempt',
  { programId: 'ielts', itemId: 'ielts-q1' },
  {
    learnerId: 'learner-b',
    entityType: 'question',
    entityId: 'ielts-q1',
    occurredAt: '2026-06-02T09:00:00.000Z',
    source: 'db_test',
  },
);

const { hashPassword, verifyPassword } = require('./password');
const { createHash } = require('crypto');

async function testPasswords(): Promise<void> {
  const h1 = await hashPassword('s3cret!');
  const h2 = await hashPassword('s3cret!');
  assert(h1 !== h2, 'Hashes of the same password must differ (random salt).');
  assert(h1.startsWith('pbkdf2-sha256$'), 'Hash must use the pbkdf2-sha256 format.');
  assert((await verifyPassword('s3cret!', h1)).ok, 'Correct password must verify.');
  assert(!(await verifyPassword('s3cret!', h1)).needsRehash, 'Fresh hash must not need rehash.');
  assert(!(await verifyPassword('wrong', h1)).ok, 'Wrong password must fail.');

  const legacySha = createHash('sha256').update('legacy-pass').digest('hex');
  const legacyResult = await verifyPassword('legacy-pass', legacySha);
  assert(legacyResult.ok && legacyResult.needsRehash, 'Legacy SHA-256 record must verify and request rehash.');
  assert(!(await verifyPassword('other', legacySha)).ok, 'Legacy SHA-256 must reject wrong password.');

  const plain = await verifyPassword('old-plain-pw', 'old-plain-pw');
  assert(plain.ok && plain.needsRehash, 'Legacy plaintext record must verify and request rehash.');
  assert(!(await verifyPassword('x', 'old-plain-pw')).ok, 'Plaintext record must reject wrong password.');
  assert(!(await verifyPassword('p', '')).ok, 'Empty stored hash must fail.');
  assert(!(await verifyPassword('', h1)).ok, 'Empty password must fail.');
}

async function main(): Promise<void> {
  await testPasswords();

  await db.saveLearningEvent(first);
  await db.saveLearningEvent(second);
  await db.saveLearningEvent(first);

  const allEvents = await db.listLearningEvents();
  assert(allEvents.length === 2, 'Learning events should be deduplicated by id.');
  assert(allEvents[0].id === second.id, 'Learning events should be listed newest first.');
  assert(
    JSON.parse(storage.getItem(SHARED_LEARNING_EVENTS_LIST_KEY) || '[]').length === 2,
    'Learning event ids should be stored under the shared learning key.',
  );
  assert(
    Boolean(storage.getItem(sharedLearningEventStorageKey(first.id))),
    'Learning event payload should be stored under the shared event key.',
  );

  const learnerAEvents = await db.listLearningEvents('learner-a');
  assert(learnerAEvents.length === 1, 'Learning events should filter by learner id.');
  assert(learnerAEvents[0].payload.programId === 'vn_math_6_9', 'Learning event payload should be preserved.');

  const limited = await db.listLearningEvents(undefined, 1);
  assert(limited.length === 1, 'Learning event list should respect limit.');
}

void main();
