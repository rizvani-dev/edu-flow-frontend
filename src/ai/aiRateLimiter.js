const requestLedger = new Map();

export const createAiRateLimiter = ({ windowMs = 60_000, maxRequests = 8 } = {}) => {
  return (scope = 'global') => {
    const now = Date.now();
    const entries = (requestLedger.get(scope) || []).filter((stamp) => now - stamp < windowMs);

    if (entries.length >= maxRequests) {
      const retryAfterMs = windowMs - (now - entries[0]);
      const error = new Error('AI request limit reached on this device. Please wait a moment.');
      error.retryAfterMs = retryAfterMs;
      throw error;
    }

    entries.push(now);
    requestLedger.set(scope, entries);
  };
};

export const aiRateGuard = createAiRateLimiter();
