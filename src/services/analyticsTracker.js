import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const VISITOR_ID_KEY = "portfolio_visitor_id";
const VISITOR_CREATED_AT_KEY = "portfolio_visitor_created_at";
const SESSION_ID_KEY = "portfolio_session_id";
const SESSION_CREATED_AT_KEY = "portfolio_session_created_at";
const ONLINE_WINDOW_MS = 45 * 1000;

let currentVisitorId = null;
let currentSessionId = null;
let currentVisitorCreatedAt = null;
let currentSessionCreatedAt = null;
let currentVisitorProfile = null;
let started = false;

const canTrack = () =>
  isFirebaseConfigured &&
  db &&
  typeof window !== "undefined" &&
  typeof localStorage !== "undefined" &&
  !window.location.hash.startsWith("#/admin-analytics");

const createId = (prefix) => {
  if (window.crypto?.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const readOrCreateLocalValue = (storage, key, factory) => {
  const existingValue = storage.getItem(key);
  if (existingValue) {
    return existingValue;
  }

  const nextValue = factory();
  storage.setItem(key, nextValue);
  return nextValue;
};

const getBrowserName = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) return "Edge";
  if (userAgent.includes("OPR/") || userAgent.includes("Opera")) return "Opera";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Safari/")) return "Safari";
  if (userAgent.includes("Firefox/")) return "Firefox";

  return "Unknown";
};

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad/.test(userAgent)) return "Tablet";
  if (/mobile|iphone|android/.test(userAgent)) return "Mobile";

  return "Desktop";
};

const getVisitorLabel = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("viewer") || params.get("ref") || "";
};

const getBaseContext = () => ({
  url: window.location.href,
  path: window.location.pathname,
  hash: window.location.hash,
  title: document.title,
  referrer: document.referrer || "Direct",
  viewerLabel: getVisitorLabel(),
});

const getClientContext = () => ({
  ...getBaseContext(),
  browser: getBrowserName(),
  device: getDeviceType(),
  language: navigator.language || "Unknown",
  screen: `${window.screen.width}x${window.screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
  userAgent: navigator.userAgent,
});

const getProfileContext = () => {
  if (!currentVisitorProfile) {
    return {};
  }

  return {
    profileName: currentVisitorProfile.displayName,
    profilePhotoURL: currentVisitorProfile.photoURL,
    profileProvider: currentVisitorProfile.provider,
  };
};

const ensureIds = () => {
  currentVisitorId = readOrCreateLocalValue(localStorage, VISITOR_ID_KEY, () =>
    createId("visitor"),
  );
  currentVisitorCreatedAt = readOrCreateLocalValue(
    localStorage,
    VISITOR_CREATED_AT_KEY,
    () => new Date().toISOString(),
  );
  currentSessionId = readOrCreateLocalValue(sessionStorage, SESSION_ID_KEY, () =>
    createId("session"),
  );
  currentSessionCreatedAt = readOrCreateLocalValue(
    sessionStorage,
    SESSION_CREATED_AT_KEY,
    () => new Date().toISOString(),
  );
};

export const trackPortfolioEvent = async (type, metadata = {}) => {
  if (!canTrack() || !currentVisitorId || !currentSessionId) {
    return;
  }

  try {
    await addDoc(collection(db, "events"), {
      type,
      visitorId: currentVisitorId,
      sessionId: currentSessionId,
      createdAt: serverTimestamp(),
      ...getBaseContext(),
      ...getProfileContext(),
      ...metadata,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio analytics event failed", error);
    }
  }
};

export const attachVisitorProfile = async (profile) => {
  if (!canTrack()) {
    return;
  }

  ensureIds();

  const visitorProfile = {
    authUid: profile.authUid || "",
    provider: profile.provider || "facebook.com",
    displayName: profile.displayName || "",
    photoURL: profile.photoURL || "",
    capturedAt: serverTimestamp(),
  };
  currentVisitorProfile = visitorProfile;

  try {
    await Promise.all([
      setDoc(
        doc(db, "visitors", currentVisitorId),
        {
          visitorId: currentVisitorId,
          lastSeenAt: serverTimestamp(),
          profile: visitorProfile,
          profileName: visitorProfile.displayName,
          profilePhotoURL: visitorProfile.photoURL,
        },
        { merge: true },
      ),
      setDoc(
        doc(db, "sessions", currentSessionId),
        {
          sessionId: currentSessionId,
          visitorId: currentVisitorId,
          lastSeenAt: serverTimestamp(),
          profile: visitorProfile,
          profileName: visitorProfile.displayName,
          profilePhotoURL: visitorProfile.photoURL,
        },
        { merge: true },
      ),
      addDoc(collection(db, "profileConsents"), {
        visitorId: currentVisitorId,
        sessionId: currentSessionId,
        authUid: visitorProfile.authUid,
        provider: visitorProfile.provider,
        displayName: visitorProfile.displayName,
        photoURL: visitorProfile.photoURL,
        createdAt: serverTimestamp(),
        ...getBaseContext(),
      }),
    ]);

    await trackPortfolioEvent("facebook_profile_allowed", {
      provider: visitorProfile.provider,
      profileName: visitorProfile.displayName,
      profilePhotoURL: visitorProfile.photoURL,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio analytics profile attach failed", error);
    }
  }
};

export const startPortfolioTracking = async () => {
  if (!canTrack() || started) {
    return { enabled: canTrack(), visitorId: currentVisitorId, sessionId: currentSessionId };
  }

  ensureIds();
  started = true;

  const clientContext = getClientContext();
  const now = serverTimestamp();

  try {
    await Promise.all([
      setDoc(
        doc(db, "visitors", currentVisitorId),
        {
          visitorId: currentVisitorId,
          firstSeenAt: new Date(currentVisitorCreatedAt),
          lastSeenAt: now,
          lastSessionId: currentSessionId,
          onlineWindowMs: ONLINE_WINDOW_MS,
          ...clientContext,
        },
        { merge: true },
      ),
      setDoc(
        doc(db, "sessions", currentSessionId),
        {
          sessionId: currentSessionId,
          visitorId: currentVisitorId,
          startedAt: new Date(currentSessionCreatedAt),
          lastSeenAt: now,
          isActive: true,
          onlineWindowMs: ONLINE_WINDOW_MS,
          ...clientContext,
          ...getProfileContext(),
        },
        { merge: true },
      ),
    ]);

    await trackPortfolioEvent("page_view");
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio analytics start failed", error);
    }
  }

  return { enabled: true, visitorId: currentVisitorId, sessionId: currentSessionId };
};

export const heartbeatPortfolioSession = async () => {
  if (!canTrack() || !currentVisitorId || !currentSessionId) {
    return;
  }

  try {
    const lastSeenAt = serverTimestamp();
    await Promise.all([
      updateDoc(doc(db, "visitors", currentVisitorId), {
        lastSeenAt,
        lastSessionId: currentSessionId,
        ...getBaseContext(),
        ...getProfileContext(),
      }),
      updateDoc(doc(db, "sessions", currentSessionId), {
        lastSeenAt,
        isActive: true,
        ...getBaseContext(),
        ...getProfileContext(),
      }),
    ]);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio analytics heartbeat failed", error);
    }
  }
};

export const stopPortfolioSession = async () => {
  if (!canTrack() || !currentSessionId) {
    return;
  }

  try {
    await updateDoc(doc(db, "sessions", currentSessionId), {
      isActive: false,
      endedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Portfolio analytics stop failed", error);
    }
  }
};
