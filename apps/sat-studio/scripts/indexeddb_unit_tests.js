const assert = require("node:assert/strict");

function createRequest(handler) {
  const request = {};
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
  const records = new Map();
  const db = {
    objectStoreNames: {
      contains(name) {
        return name === "questions";
      },
    },
    createObjectStore() {},
    transaction() {
      const transaction = {
        pending: 0,
        completed: false,
        track(request) {
          transaction.pending++;
          const originalSuccess = request.onsuccess;
          const originalError = request.onerror;
          request.onsuccess = (...args) => {
            originalSuccess?.(...args);
            transaction.pending--;
            if (!transaction.pending && !transaction.completed) {
              transaction.completed = true;
              setTimeout(() => transaction.oncomplete?.(), 0);
            }
          };
          request.onerror = (...args) => {
            originalError?.(...args);
            transaction.error = request.error;
            transaction.onerror?.();
          };
          return request;
        },
        objectStore() {
          return {
            clear() {
              return transaction.track(createRequest(() => records.clear()));
            },
            put(value) {
              return transaction.track(createRequest(() => records.set(value.id, { ...value })));
            },
            get(id) {
              return createRequest((request) => {
                request.result = records.get(id) || null;
              });
            },
            getAll() {
              return createRequest((request) => {
                request.result = [...records.values()];
              });
            },
          };
        },
      };
      return transaction;
    },
  };

  return {
    open() {
      const request = {};
      setTimeout(() => {
        request.result = db;
        request.onupgradeneeded?.({ target: { result: db } });
        request.onsuccess?.();
      }, 0);
      return request;
    },
    records,
  };
}

async function run() {
  const fake = createFakeIndexedDB();
  global.indexedDB = fake;
  const indexed = require("../sat_indexeddb.js");

  await indexed.saveBank([
    { id: "q1", prompt: "First" },
    { id: "q2", prompt: "Second" },
  ]);
  assert.equal(fake.records.size, 2);
  assert.equal((await indexed.getQuestion("q1")).prompt, "First");
  assert.equal(await indexed.getQuestion("missing"), null);
  assert.deepEqual(
    (await indexed.loadBank()).map((question) => question.id).sort(),
    ["q1", "q2"],
  );

  await indexed.saveBank([{ id: "q3", prompt: "Replacement" }]);
  assert.deepEqual(
    (await indexed.loadBank()).map((question) => question.id),
    ["q3"],
  );
}

run()
  .then(() => console.log("indexeddb_unit_tests: pass"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
