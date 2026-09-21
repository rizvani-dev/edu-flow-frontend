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
  ADMIN_NOTIFICATIONS: (id) => `admin_notifications_${id}`,
  ADMIN_ANNOUNCEMENTS: (id) => `admin_announcements_${id}`,
  STUDENT_DASHBOARD: (id) => `student_dashboard_${id}`,
  STUDENT_NOTIFICATIONS: (id) => `student_notifications_${id}`,
  STUDENT_FEES: (id) => `student_fees_${id}`,
  STUDENT_HOMEWORK: (id) => `student_homework_${id}`,
  STUDENT_EXAMS: (id) => `student_exams_${id}`,
  CHAT_HISTORY: (id) => `chat_history_${id}`,
  TEACHER_STUDENTS: (id) => `teacher_students_${id}`,
  TEACHER_DASHBOARD: (id) => `teacher_dashboard_${id}`,
  TEACHER_ANNOUNCEMENTS: (id) => `teacher_announcements_${id}`,
  TEACHER_NOTIFICATIONS: (id) => `teacher_notifications_${id}`,
  TEACHER_HOMEWORK: (id) => `teacher_homework_${id}`,
  TEACHER_EXAMS: (id) => `teacher_exams_${id}`,
  DASHBOARD_VIEW: (role, id) => `dashboard_view_${role}_${id}`,
  DASHBOARD_REMINDER: (role, id) => `dashboard_reminder_${role}_${id}`,
};

/**
 * Save data to local storage with an expiry timestamp.
 * @param {string} key - Cache identifier
 * @param {any} value - Data to store (must be JSON serializable)
 * @param {number} ttlMinutes - Duration in minutes before data expires (default 5)
 */
export const setCache = (key, value, ttlMinutes = 5) => {
  try {
    const createdAt = new Date().getTime();
    const expiry = new Date().getTime() + ttlMinutes * 60 * 1000;
    const payload = {
      value,
      createdAt,
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

export const clearUserCache = (userId) => {
  if (!userId) {
    clearCacheByPrefix(CACHE_PREFIX);
    return;
  }

  const suffix = String(userId);
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(CACHE_PREFIX)) return;
    if (key.includes(`_${suffix}`) || key.includes(`:${suffix}`)) {
      localStorage.removeItem(key);
    }
  });
};

export const purgeExpiredCache = (maxAgeDays = 7) => {
  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(CACHE_PREFIX)) return;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const item = JSON.parse(raw);
      const createdAt = Number(item?.createdAt || 0);
      const expiry = Number(item?.expiry || 0);

      if (!createdAt || !expiry || now > expiry || now - createdAt > maxAgeMs) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      localStorage.removeItem(key);
    }
  });
};

export const getUiState = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}ui_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const setUiState = (key, value) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}ui_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage UI state write error:', error);
  }
};
