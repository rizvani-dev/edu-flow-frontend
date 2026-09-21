const AI_CACHE_PREFIX = 'eduflow:ai:cache:';
const DEFAULT_TTL_MS = 1000 * 60 * 15;

export const createAiCacheKey = (scope, payload = {}) =>
  `${AI_CACHE_PREFIX}${scope}:${JSON.stringify(payload)}`;

export const getAiCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
};

export const setAiCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        expiresAt: Date.now() + ttlMs,
      })
    );
  } catch {
    // ignore quota issues
  }
};

export const withAiCache = async (scope, payload, compute, ttlMs = DEFAULT_TTL_MS) => {
  const key = createAiCacheKey(scope, payload);
  const cached = getAiCache(key);
  if (cached) return cached;

  const result = await compute();
  setAiCache(key, result, ttlMs);
  return result;
};
