/**
 * Local Storage Cache Utility with TTL (Time To Live) support.
 * 
 * Analysis:
 * Since the project is multi-tenant (using school_id), cache keys should ideally
 * be prefixed with the school or user ID to prevent data leakage between sessions.
 */

const CACHE_PREFIX = 'sm_cache_';

export const CACHE_KEYS = {
  ADMIN_ANALYTICS: 'admin_analytics',
  USER_DETAILS: 'user_details',
  SCHOOLS: 'schools',
  CHATS: 'chats',
  ADMIN_DASHBOARD: (suffix) => `admin_dashboard_${suffix}`,
  STUDENT_DASHBOARD: (id) => `student_dashboard_${id}`,
  CHAT_HISTORY: (id) => `chat_history_${id}`,
  TEACHER_STUDENTS: (id) => `teacher_students_${id}`,
};

/**
 * Save data to local storage with an expiry timestamp.
 * @param {string} key - Cache identifier
 * @param {any} value - Data to store (must be JSON serializable)
 * @param {number} ttlMinutes - Duration in minutes before data expires (default 5)
 */
export const setCache = (key, value, ttlMinutes = 5) => {
  try {
    const expiry = new Date().getTime() + ttlMinutes * 60 * 1000;
    const payload = {
      value,
      expiry,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (error) {
    console.error('LocalStorage Cache Write Error:', error);
    // If storage is full, clear older sm_cache entries
    if (error.name === 'QuotaExceededError') {
      clearCacheByPrefix(CACHE_PREFIX);
    }
  }
};

/**
 * Retrieve data from local storage, checking for expiration.
 * @param {string} key - Cache identifier
 * @returns {any|null} The cached value or null if expired/missing
 */
export const getCache = (key) => {
  try {
    const itemStr = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('LocalStorage Cache Read Error:', error);
    return null;
  }
};

/**
 * Explicitly removes an item from the cache.
 */
export const removeCache = (key) => {
  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
};

/**
 * Clears all cache items matching a prefix. 
 * Highly recommended to call this on Logout.
 */
export const clearCacheByPrefix = (prefix = CACHE_PREFIX) => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
};