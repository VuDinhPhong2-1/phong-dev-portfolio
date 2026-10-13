/**
 * Multi-layer persistent storage to keep visitor identity as long as possible.
 * Combines localStorage, long-lived Cookie (max-age 400 days), and cross-sync.
 */

const COOKIE_MAX_AGE_DAYS = 400; // Safari ITP limit is 7d for scripts, cookies provide resilient fallback
const COOKIE_MAX_AGE_SECONDS = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;

// Cookie helpers
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
};

const setCookie = (name, value, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) => {
  if (typeof document === "undefined") return;
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax${secure}`;
  } catch (err) {
    // ignore cookie set failure
  }
};

/**
 * Get a value with fallback and self-healing:
 * 1. Check localStorage
 * 2. Check document.cookie
 * If found in one but not the other, restore the missing one.
 */
export const getPersistentItem = (key) => {
  if (typeof window === "undefined") return null;

  let localVal = null;
  try {
    localVal = window.localStorage ? window.localStorage.getItem(key) : null;
  } catch (e) {
    // localStorage might be blocked in private mode
  }

  const cookieVal = getCookie(key);

  if (localVal && !cookieVal) {
    setCookie(key, localVal);
    return localVal;
  }

  if (!localVal && cookieVal) {
    try {
      window.localStorage?.setItem(key, cookieVal);
    } catch (e) {}
    return cookieVal;
  }

  return localVal || cookieVal || null;
};

/**
 * Store value across both localStorage and Cookie.
 */
export const setPersistentItem = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage?.setItem(key, value);
  } catch (e) {}

  setCookie(key, value);
};

/**
 * Read or create a persistent value.
 */
export const readOrCreatePersistentItem = (key, factory) => {
  const existing = getPersistentItem(key);
  if (existing) {
    return existing;
  }

  const fresh = factory();
  setPersistentItem(key, fresh);
  return fresh;
};
