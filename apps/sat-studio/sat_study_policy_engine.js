(function initSatStudyPolicyEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  if (root) {
    root.SatStudyPolicyEngine = engine;
  }
})(typeof window !== "undefined" ? window : globalThis, function createSatStudyPolicyEngine() {
  const DEFAULT_STUDY_POLICY_URL = "data/question-study-policy.json";

  function normalizePolicy(policy) {
    const normalized = policy && typeof policy === "object" ? policy : null;
    const ids = Array.isArray(normalized?.suppressedDefaultStudyIds) ? normalized.suppressedDefaultStudyIds : [];
    return {
      policy: normalized,
      suppressedDefaultStudyIds: new Set(ids.map((id) => String(id)).filter(Boolean)),
    };
  }

  function createManager() {
    let state = normalizePolicy(null);
    let loadPromise = null;

    function set(policy) {
      state = normalizePolicy(policy);
      return state.policy;
    }

    async function load(fetchJson, fetchImpl, url = DEFAULT_STUDY_POLICY_URL) {
      if (state.policy) return state.policy;
      if (loadPromise) return loadPromise;
      loadPromise = Promise.resolve()
        .then(() => fetchJson(fetchImpl, url, "Question study policy missing"))
        .then((policy) => set(policy))
        .catch((error) => {
          set(null);
          throw error;
        })
        .finally(() => {
          loadPromise = null;
        });
      return loadPromise;
    }

    function isSuppressed(question) {
      return state.suppressedDefaultStudyIds.has(String(question?.id || ""));
    }

    return {
      set,
      load,
      isSuppressed,
      get policy() {
        return state.policy;
      },
      get suppressedDefaultStudyIds() {
        return state.suppressedDefaultStudyIds;
      },
    };
  }

  return {
    DEFAULT_STUDY_POLICY_URL,
    normalizePolicy,
    createManager,
  };
});
