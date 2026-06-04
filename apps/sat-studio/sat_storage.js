(function initSatStudioStorage(root, factory) {
  const storage = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = storage;
  }
  if (root) {
    root.SatStudioStorage = storage;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudioStorage() {
  const CHUNK_MARKER = "__satStudioChunked";
  const DEFAULT_CHUNK_SIZE = 750000;

  function storageChunkKey(key, index) {
    return `${key}:chunk:${index}`;
  }

  function parseStorageChunkMeta(value) {
    if (!value) return null;
    try {
      const meta = JSON.parse(value);
      return meta?.[CHUNK_MARKER] && Number.isInteger(meta.chunks) ? meta : null;
    } catch {
      return null;
    }
  }

  function removeStoredStateChunks(storage, key, meta = null) {
    const existingMeta = meta || parseStorageChunkMeta(storage.getItem(key));
    const count = existingMeta?.chunks || 0;
    for (let index = 0; index < count; index += 1) {
      storage.removeItem(storageChunkKey(key, index));
    }
  }

  function readStoredStateJson(storage, key) {
    const raw = storage.getItem(key);
    const meta = parseStorageChunkMeta(raw);
    if (!meta) return raw;

    const chunks = [];
    for (let index = 0; index < meta.chunks; index += 1) {
      const chunk = storage.getItem(storageChunkKey(key, index));
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join("");
  }

  function writeStoredStateJson(storage, key, json, options = {}) {
    const chunkSize = Number(options.chunkSize || DEFAULT_CHUNK_SIZE);
    const previousMeta = parseStorageChunkMeta(storage.getItem(key));
    removeStoredStateChunks(storage, key, previousMeta);

    if (json.length <= chunkSize) {
      storage.setItem(key, json);
      return { chunked: false, chunks: 0, length: json.length };
    }

    const chunks = Math.ceil(json.length / chunkSize);
    for (let index = 0; index < chunks; index += 1) {
      storage.setItem(storageChunkKey(key, index), json.slice(index * chunkSize, (index + 1) * chunkSize));
    }
    storage.setItem(
      key,
      JSON.stringify({
        [CHUNK_MARKER]: true,
        version: 1,
        chunks,
        length: json.length,
        savedAt: new Date().toISOString(),
      }),
    );
    return { chunked: true, chunks, length: json.length };
  }

  function byteLength(text = "") {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(text)).length;
    return String(text).length * 2;
  }

  function storedStateSnapshot(storage, key) {
    const raw = storage.getItem(key);
    const meta = parseStorageChunkMeta(raw);
    if (!raw) {
      return {
        exists: false,
        chunked: false,
        chunks: 0,
        missingChunks: [],
        length: 0,
        approximateBytes: 0,
      };
    }
    if (!meta) {
      return {
        exists: true,
        chunked: false,
        chunks: 0,
        missingChunks: [],
        length: raw.length,
        approximateBytes: byteLength(raw),
      };
    }

    let length = 0;
    let approximateBytes = byteLength(raw);
    const missingChunks = [];
    for (let index = 0; index < meta.chunks; index += 1) {
      const chunk = storage.getItem(storageChunkKey(key, index));
      if (chunk === null) {
        missingChunks.push(index);
        continue;
      }
      length += chunk.length;
      approximateBytes += byteLength(chunk);
    }

    return {
      exists: true,
      chunked: true,
      chunks: meta.chunks,
      missingChunks,
      length: meta.length || length,
      approximateBytes,
    };
  }

  function storageHealth(snapshot = {}, thresholds = {}) {
    const warningBytes = Number(thresholds.warningBytes || 3500000);
    const dangerBytes = Number(thresholds.dangerBytes || 4800000);
    const approximateBytes = Number(snapshot.approximateBytes || 0);
    if (snapshot.missingChunks?.length) {
      return {
        level: "danger",
        label: "Repair needed",
        message: `${snapshot.missingChunks.length} storage chunk(s) are missing. Import a backup if data looks incomplete.`,
      };
    }
    if (approximateBytes >= dangerBytes) {
      return {
        level: "danger",
        label: "Backup now",
        message: "Local browser storage is near the practical limit. Export a backup before adding more activity.",
      };
    }
    if (approximateBytes >= warningBytes) {
      return {
        level: "warning",
        label: "Backup recommended",
        message: "Local progress data is growing. Export a backup and consider moving to backend storage before public use.",
      };
    }
    return {
      level: "ok",
      label: "Healthy",
      message: "File-backed question banks stay out of localStorage; export periodically for safety.",
    };
  }

  return {
    CHUNK_MARKER,
    DEFAULT_CHUNK_SIZE,
    byteLength,
    parseStorageChunkMeta,
    readStoredStateJson,
    removeStoredStateChunks,
    storageHealth,
    storageChunkKey,
    storedStateSnapshot,
    writeStoredStateJson,
  };
});
