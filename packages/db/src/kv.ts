/**
 * Async key-value backends for LocalStorageAdapter-family adapters.
 *
 * LocalStorageKV keeps the historical behaviour (5MB quota, sync engine).
 * IndexedDbKV lifts the quota to browser-managed storage (typically GBs) so
 * seeded question banks and exam attempts stop hitting QuotaExceededError in
 * web mode. Learning events intentionally stay in window.localStorage because
 * the shared @miuprep/learning helpers are synchronous.
 */
export interface AsyncKV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export class LocalStorageKV implements AsyncKV {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async keys(): Promise<string[]> {
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) out.push(key);
    }
    return out;
  }
}

const IDB_STORE = 'kv';

export class IndexedDbKV implements AsyncKV {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private dbName: string;

  constructor(dbName: string = 'miuprep_kv') {
    this.dbName = dbName;
  }

  private open(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(IDB_STORE)) {
            req.result.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise;
  }

  private async tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE, mode);
      const request = run(transaction.objectStore(IDB_STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<string | null> {
    const value = await this.tx<string | undefined>('readonly', (s) => s.get(key) as IDBRequest<string | undefined>);
    return value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.tx('readwrite', (s) => s.put(value, key));
  }

  async remove(key: string): Promise<void> {
    await this.tx('readwrite', (s) => s.delete(key));
  }

  async keys(): Promise<string[]> {
    const result = await this.tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
    return result.map(String);
  }
}
