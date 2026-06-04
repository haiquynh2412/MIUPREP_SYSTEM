const DB_NAME = "SatStudioViteOffline";
const DB_VERSION = 1;
const STORE_NAME = "kv";
const LOCAL_STORAGE_PREFIX = "sat-studio:vite-offline:";

export interface OfflineStoreRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: string;
}

export type OfflineWriteDriver = "indexeddb" | "localStorage" | "memory";

export interface OfflineStoreOptions {
  indexedDb?: IDBFactory | null;
  storage?: Storage | null;
}

const memoryFallback = new Map<string, string>();

function getIndexedDb(options: OfflineStoreOptions = {}): IDBFactory | null {
  if (options.indexedDb !== undefined) return options.indexedDb;
  return typeof indexedDB === "undefined" ? null : indexedDB;
}

function getStorage(options: OfflineStoreOptions = {}): Storage | null {
  if (options.storage !== undefined) return options.storage;
  return typeof localStorage === "undefined" ? null : localStorage;
}

function storageKey(key: string): string {
  return `${LOCAL_STORAGE_PREFIX}${key}`;
}

function serializeRecord<T>(key: string, value: T): OfflineStoreRecord<T> {
  return {
    key,
    value,
    updatedAt: new Date().toISOString(),
  };
}

function openOfflineDb(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open offline store."));
  });
}

async function readIndexedDb<T>(key: string, factory: IDBFactory): Promise<T | undefined> {
  const db = await openOfflineDb(factory);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => {
      const record = request.result as OfflineStoreRecord<T> | undefined;
      resolve(record?.value);
    };
    request.onerror = () => reject(request.error || new Error("Could not read offline value."));
  });
}

async function writeIndexedDb<T>(key: string, value: T, factory: IDBFactory): Promise<void> {
  const db = await openOfflineDb(factory);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not write offline value."));
    transaction.onabort = () => reject(transaction.error || new Error("Offline write aborted."));
    store.put(serializeRecord(key, value));
  });
}

async function deleteIndexedDb(key: string, factory: IDBFactory): Promise<void> {
  const db = await openOfflineDb(factory);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete offline value."));
    transaction.onabort = () => reject(transaction.error || new Error("Offline delete aborted."));
    store.delete(key);
  });
}

function readLocalFallback<T>(key: string, fallback: T, storage: Storage | null): T {
  const raw = storage?.getItem(storageKey(key)) ?? memoryFallback.get(storageKey(key));
  if (!raw) return fallback;
  try {
    const record = JSON.parse(raw) as OfflineStoreRecord<T>;
    return record && "value" in record ? record.value : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalFallback<T>(key: string, value: T, storage: Storage | null): OfflineWriteDriver {
  const serialized = JSON.stringify(serializeRecord(key, value));
  if (storage) {
    try {
      storage.setItem(storageKey(key), serialized);
      return "localStorage";
    } catch {
      memoryFallback.set(storageKey(key), serialized);
      return "memory";
    }
  }
  memoryFallback.set(storageKey(key), serialized);
  return "memory";
}

function deleteLocalFallback(key: string, storage: Storage | null): void {
  storage?.removeItem(storageKey(key));
  memoryFallback.delete(storageKey(key));
}

export async function loadOfflineValue<T>(key: string, fallback: T, options: OfflineStoreOptions = {}): Promise<T> {
  const factory = getIndexedDb(options);
  if (factory) {
    try {
      const value = await readIndexedDb<T>(key, factory);
      if (value !== undefined) return value;
    } catch {
      // Fall through to localStorage/memory fallback.
    }
  }
  return readLocalFallback(key, fallback, getStorage(options));
}

export async function saveOfflineValue<T>(key: string, value: T, options: OfflineStoreOptions = {}): Promise<OfflineWriteDriver> {
  const factory = getIndexedDb(options);
  if (factory) {
    try {
      await writeIndexedDb(key, value, factory);
      writeLocalFallback(key, value, getStorage(options));
      return "indexeddb";
    } catch {
      // Fall through to localStorage/memory fallback.
    }
  }
  return writeLocalFallback(key, value, getStorage(options));
}

export async function deleteOfflineValue(key: string, options: OfflineStoreOptions = {}): Promise<void> {
  const factory = getIndexedDb(options);
  if (factory) {
    try {
      await deleteIndexedDb(key, factory);
    } catch {
      // Still clear fallback storage below.
    }
  }
  deleteLocalFallback(key, getStorage(options));
}

export function offlineStoreFallbackKey(key: string): string {
  return storageKey(key);
}
