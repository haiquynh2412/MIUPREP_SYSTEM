(function initSatStudioIndexedDB(root, factory) {
  const indexedDB = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = indexedDB;
  }
  if (root) {
    root.SatStudioIndexedDB = indexedDB;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioIndexedDB() {
  const DB_NAME = "SatStudioDB";
  const DB_VERSION = 1;
  const STORE_NAME = "questions";

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getQuestion(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveBank(questions = []) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Question bank save aborted."));

      store.clear();
      for (const question of questions) {
        store.put(question);
      }
    });
  }

  async function loadBank() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  return {
    getQuestion,
    loadBank,
    saveBank,
  };
});
