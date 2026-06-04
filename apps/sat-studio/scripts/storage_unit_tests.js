const assert = require("node:assert/strict");
const storageModule = require("../sat_storage.js");

function fakeStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    keys() {
      return [...values.keys()].sort();
    },
  };
}

function run() {
  const storage = fakeStorage();
  const key = "sat-test";

  storageModule.writeStoredStateJson(storage, key, "small", { chunkSize: 10 });
  assert.equal(storageModule.readStoredStateJson(storage, key), "small");
  assert.deepEqual(storage.keys(), [key]);

  const large = "abcdefghijklmnopqrstuvwxyz";
  const result = storageModule.writeStoredStateJson(storage, key, large, { chunkSize: 5 });
  assert.equal(result.chunked, true);
  assert.equal(result.chunks, 6);
  assert.equal(storageModule.readStoredStateJson(storage, key), large);
  assert.ok(storageModule.parseStorageChunkMeta(storage.getItem(key)));

  storage.removeItem(storageModule.storageChunkKey(key, 3));
  assert.equal(storageModule.readStoredStateJson(storage, key), null);

  storageModule.writeStoredStateJson(storage, key, "tiny", { chunkSize: 5 });
  assert.equal(storageModule.readStoredStateJson(storage, key), "tiny");
  assert.deepEqual(storage.keys(), [key]);

  const snapshot = storageModule.storedStateSnapshot(storage, key);
  assert.equal(snapshot.exists, true);
  assert.equal(snapshot.chunked, false);
  assert.ok(snapshot.approximateBytes >= 4);
  assert.equal(storageModule.storageHealth(snapshot, { warningBytes: 100, dangerBytes: 200 }).level, "ok");
  assert.equal(storageModule.storageHealth({ approximateBytes: 150 }, { warningBytes: 100, dangerBytes: 200 }).level, "warning");
  assert.equal(storageModule.storageHealth({ approximateBytes: 250 }, { warningBytes: 100, dangerBytes: 200 }).level, "danger");
  assert.equal(storageModule.storageHealth({ approximateBytes: 1, missingChunks: [1] }).level, "danger");
}

run();
console.log("storage_unit_tests: pass");
