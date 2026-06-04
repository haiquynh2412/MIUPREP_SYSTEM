import assert from "node:assert/strict";
import { deleteOfflineValue, loadOfflineValue, offlineStoreFallbackKey, saveOfflineValue } from "./offline-store";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

class QuotaStorage extends MemoryStorage {
  setItem(): void {
    throw new DOMException("quota", "QuotaExceededError");
  }
}

function createRequest(handler: (request: { result?: unknown; error?: unknown }) => void) {
  const request: { result?: unknown; error?: unknown; onsuccess?: () => void; onerror?: () => void } = {};
  setTimeout(() => {
    try {
      handler(request);
      request.onsuccess?.();
    } catch (error) {
      request.error = error;
      request.onerror?.();
    }
  }, 0);
  return request;
}

function createFakeIndexedDB() {
  const records = new Map<string, unknown>();
  const db = {
    objectStoreNames: {
      contains(name: string) {
        return name === "kv";
      },
    },
    createObjectStore() {},
    transaction() {
      const transaction: {
        error?: unknown;
        oncomplete?: () => void;
        onerror?: () => void;
        onabort?: () => void;
        objectStore: () => Record<string, (value?: unknown) => unknown>;
        track: (request: ReturnType<typeof createRequest>) => ReturnType<typeof createRequest>;
        pending: number;
        completed: boolean;
      } = {
        pending: 0,
        completed: false,
        track(request) {
          transaction.pending++;
          const originalSuccess = request.onsuccess;
          const originalError = request.onerror;
          request.onsuccess = () => {
            originalSuccess?.();
            transaction.pending--;
            if (!transaction.pending && !transaction.completed) {
              transaction.completed = true;
              setTimeout(() => transaction.oncomplete?.(), 0);
            }
          };
          request.onerror = () => {
            originalError?.();
            transaction.error = request.error;
            transaction.onerror?.();
          };
          return request;
        },
        objectStore() {
          return {
            put(value) {
              return transaction.track(createRequest(() => records.set((value as { key: string }).key, value)));
            },
            get(key) {
              return createRequest((request) => {
                request.result = records.get(String(key)) || undefined;
              });
            },
            delete(key) {
              return transaction.track(createRequest(() => records.delete(String(key))));
            },
          };
        },
      };
      return transaction;
    },
  };

  return {
    open() {
      const request: { result?: unknown; onsuccess?: () => void; onerror?: () => void; onupgradeneeded?: () => void; error?: unknown } = {};
      setTimeout(() => {
        request.result = db;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      }, 0);
      return request;
    },
    records,
  };
}

async function run() {
  const fake = createFakeIndexedDB();
  const storage = new MemoryStorage();

  assert.equal(await saveOfflineValue("bluebook", { active: true, index: 3 }, { indexedDb: fake as unknown as IDBFactory, storage }), "indexeddb");
  assert.equal(fake.records.size, 1);
  assert.deepEqual(await loadOfflineValue("bluebook", { active: false }, { indexedDb: fake as unknown as IDBFactory, storage }), { active: true, index: 3 });

  await deleteOfflineValue("bluebook", { indexedDb: fake as unknown as IDBFactory, storage });
  assert.deepEqual(await loadOfflineValue("bluebook", { active: false }, { indexedDb: fake as unknown as IDBFactory, storage }), { active: false });

  assert.equal(await saveOfflineValue("queue", [{ id: "sync-1" }], { indexedDb: null, storage }), "localStorage");
  assert.ok(storage.getItem(offlineStoreFallbackKey("queue")));
  assert.deepEqual(await loadOfflineValue("queue", [], { indexedDb: null, storage }), [{ id: "sync-1" }]);

  const quotaStorage = new QuotaStorage();
  assert.equal(await saveOfflineValue("big-package", { items: ["large"] }, { indexedDb: null, storage: quotaStorage }), "memory");
  assert.deepEqual(await loadOfflineValue("big-package", null, { indexedDb: null, storage: quotaStorage }), { items: ["large"] });
}

run()
  .then(() => console.log("offline-store.test: pass"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
