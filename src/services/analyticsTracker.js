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

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

let currentVisitorId = null;
let currentSessionId = null;

let currentVisitorCreatedAt = null;
let currentSessionCreatedAt = null;

let currentVisitorProfile = null;

// IP context
let currentIpContext = null;
let ipContextPromise = null;

// LOCATION context
let currentLocationContext = null;

let started = false;

/* =========================================================
   TRACKING CHECK
========================================================= */

const canTrack = () =>
  isFirebaseConfigured &&
  db &&
  typeof window !== "undefined" &&
  typeof localStorage !== "undefined" &&
  !window.location.hash.startsWith("#/admin-analytics");

/* =========================================================
   ID
========================================================= */

const createId = (prefix) => {
  if (window.crypto?.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
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

/* =========================================================
   BROWSER
========================================================= */

const getBrowserName = () => {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Edg/")) return "Edge";

  if (
    userAgent.includes("OPR/") ||
    userAgent.includes("Opera")
  ) {
    return "Opera";
  }

  if (userAgent.includes("Chrome/")) return "Chrome";

  if (userAgent.includes("Safari/")) return "Safari";

  if (userAgent.includes("Firefox/")) return "Firefox";

  return "Unknown";
};

/* =========================================================
   DEVICE
========================================================= */

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad/.test(userAgent)) {
    return "Tablet";
  }

  if (/mobile|iphone|android/.test(userAgent)) {
    return "Mobile";
  }

  return "Desktop";
};

/* =========================================================
   OPERATING SYSTEM
========================================================= */

const getOperatingSystem = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || "";

  if (
    /Windows/i.test(platform) ||
    /Windows/i.test(userAgent)
  ) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Mac/i.test(platform)) {
    return "macOS";
  }

  if (/Linux/i.test(platform)) {
    return "Linux";
  }

  return "Unknown";
};

/* =========================================================
   DEVICE MODEL
========================================================= */

const getDeviceModel = () => {
  const userAgentData = navigator.userAgentData;

  if (userAgentData?.platform) {
    return userAgentData.platform;
  }

  const userAgent = navigator.userAgent;

  const androidModel = userAgent.match(
    /Android\s[\d.]+;\s([^;)]+)/i
  );

  if (androidModel?.[1]) {
    return androidModel[1]
      .replace(/\sBuild\/.*/i, "")
      .trim();
  }

  if (/iPhone/i.test(userAgent)) {
    return "iPhone";
  }

  if (/iPad/i.test(userAgent)) {
    return "iPad";
  }

  return navigator.platform || "Unknown";
};

/* =========================================================
   NETWORK
========================================================= */

const getNetworkContext = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    return {};
  }

  return {
    networkEffectiveType:
      connection.effectiveType || "Unknown",

    networkDownlink:
      typeof connection.downlink === "number"
        ? connection.downlink
        : null,

    networkRtt:
      typeof connection.rtt === "number"
        ? connection.rtt
        : null,

    saveData: Boolean(connection.saveData),
  };
};

/* =========================================================
   IP
========================================================= */

export const getPortfolioIpContext = async () => {
  if (currentIpContext) {
    return currentIpContext;
  }

  if (ipContextPromise) {
    return ipContextPromise;
  }

  if (typeof fetch !== "function") {
    return {};
  }

  ipContextPromise = fetch("/api/visitor-ip", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        return {};
      }

      const data = await response.json();

      const ipAddress = String(
        data.ipAddress || ""
      ).trim();

      currentIpContext = ipAddress
        ? {
            ipAddress,
          }
        : {};

      return currentIpContext;
    })
    .catch(() => ({}));

  return ipContextPromise;
};

const getCachedIpContext = () => {
  return currentIpContext || {};
};

/* =========================================================
   LOCATION
========================================================= */

/**
 * Gọi hàm này từ App.jsx sau khi người dùng
 * cho phép lấy vị trí.
 *
 * locationData có thể gồm:
 *
 * {
 *   latitude,
 *   longitude,
 *   accuracy,
 *   address,
 *   road,
 *   ward,
 *   district,
 *   city,
 *   country
 * }
 */
export const setCachedLocationContext = (locationData) => {
  if (!locationData) {
    currentLocationContext = null;
    return;
  }

  const latitude = Number(locationData.latitude);
  const longitude = Number(locationData.longitude);
  const accuracy = Number(locationData.accuracy);

  currentLocationContext = {
    latitude: Number.isFinite(latitude)
      ? latitude
      : null,

    longitude: Number.isFinite(longitude)
      ? longitude
      : null,

    accuracy: Number.isFinite(accuracy)
      ? accuracy
      : null,

    address:
      locationData.address || null,

    road:
      locationData.road || null,

    ward:
      locationData.ward || null,

    district:
      locationData.district || null,

    city:
      locationData.city || null,

    country:
      locationData.country || null,

    locationSource:
      "browser_geolocation",

    locationCapturedAt: serverTimestamp(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log(
      "📍 Cached location context:",
      currentLocationContext
    );
  }
};

const getCachedLocationContext = () => {
  return currentLocationContext || {};
};

/* =========================================================
   VISITOR LABEL
========================================================= */

const getVisitorLabel = () => {
  const params = new URLSearchParams(
    window.location.search
  );

  return (
    params.get("viewer") ||
    params.get("ref") ||
    ""
  );
};

/* =========================================================
   BASE CONTEXT
========================================================= */

const getBaseContext = () => ({
  url: window.location.href,

  path: window.location.pathname,

  hash: window.location.hash,

  title: document.title,

  referrer:
    document.referrer || "Direct",

  viewerLabel: getVisitorLabel(),
});

/* =========================================================
   CLIENT CONTEXT
========================================================= */

const getClientContext = () => ({
  ...getBaseContext(),

  browser: getBrowserName(),

  device: getDeviceType(),

  operatingSystem: getOperatingSystem(),

  deviceModel: getDeviceModel(),

  platform:
    navigator.platform || "Unknown",

  vendor:
    navigator.vendor || "Unknown",

  language:
    navigator.language || "Unknown",

  languages:
    Array.isArray(navigator.languages)
      ? navigator.languages.join(", ")
      : "",

  screen:
    `${window.screen.width}x${window.screen.height}`,

  viewport:
    `${window.innerWidth}x${window.innerHeight}`,

  colorDepth:
    window.screen.colorDepth || null,

  pixelRatio:
    window.devicePixelRatio || 1,

  hardwareConcurrency:
    navigator.hardwareConcurrency || null,

  deviceMemory:
    navigator.deviceMemory || null,

  maxTouchPoints:
    navigator.maxTouchPoints || 0,

  cookiesEnabled:
    navigator.cookieEnabled,

  doNotTrack:
    navigator.doNotTrack ||
    window.doNotTrack ||
    "unspecified",

  timezone:
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone || "Unknown",

  userAgent:
    navigator.userAgent,

  ...getNetworkContext(),

  // QUAN TRỌNG
  ...getCachedIpContext(),

  // QUAN TRỌNG
  ...getCachedLocationContext(),
});

/* =========================================================
   PROFILE
========================================================= */

const getProfileContext = () => {
  if (!currentVisitorProfile) {
    return {};
  }

  return {
    profileName:
      currentVisitorProfile.displayName,

    profilePhotoURL:
      currentVisitorProfile.photoURL,

    profileProvider:
      currentVisitorProfile.provider,
  };
};

/* =========================================================
   IDS
========================================================= */

const ensureIds = () => {
  currentVisitorId = readOrCreateLocalValue(
    localStorage,
    VISITOR_ID_KEY,
    () => createId("visitor")
  );

  currentVisitorCreatedAt =
    readOrCreateLocalValue(
      localStorage,
      VISITOR_CREATED_AT_KEY,
      () => new Date().toISOString()
    );

  currentSessionId =
    readOrCreateLocalValue(
      sessionStorage,
      SESSION_ID_KEY,
      () => createId("session")
    );

  currentSessionCreatedAt =
    readOrCreateLocalValue(
      sessionStorage,
      SESSION_CREATED_AT_KEY,
      () => new Date().toISOString()
    );
};

/* =========================================================
   EVENT
========================================================= */

export const trackPortfolioEvent = async (
  type,
  metadata = {}
) => {
  if (
    !canTrack() ||
    !currentVisitorId ||
    !currentSessionId
  ) {
    return;
  }

  try {
    await addDoc(
      collection(db, "events"),
      {
        type,

        visitorId:
          currentVisitorId,

        sessionId:
          currentSessionId,

        createdAt:
          serverTimestamp(),

        ...getClientContext(),

        ...getProfileContext(),

        ...metadata,
      }
    );
  } catch (error) {
    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.warn(
        "Portfolio analytics event failed",
        error
      );
    }
  }
};

/* =========================================================
   ATTACH PROFILE
========================================================= */

export const attachVisitorProfile = async (
  profile
) => {
  if (!canTrack()) {
    return;
  }

  ensureIds();

  const visitorProfile = {
    authUid:
      profile.authUid || "",

    provider:
      profile.provider ||
      "anonymous_alias",

    displayName:
      profile.displayName || "",

    photoURL:
      profile.photoURL || "",

    capturedAt:
      serverTimestamp(),
  };

  currentVisitorProfile =
    visitorProfile;

  try {
    await Promise.all([
      /* =========================
         VISITOR
      ========================= */

      setDoc(
        doc(
          db,
          "visitors",
          currentVisitorId
        ),
        {
          visitorId:
            currentVisitorId,

          lastSeenAt:
            serverTimestamp(),

          profile:
            visitorProfile,

          profileName:
            visitorProfile.displayName,

          profilePhotoURL:
            visitorProfile.photoURL,

          ...getClientContext(),
        },
        {
          merge: true,
        }
      ),

      /* =========================
         SESSION
      ========================= */

      setDoc(
        doc(
          db,
          "sessions",
          currentSessionId
        ),
        {
          sessionId:
            currentSessionId,

          visitorId:
            currentVisitorId,

          lastSeenAt:
            serverTimestamp(),

          profile:
            visitorProfile,

          profileName:
            visitorProfile.displayName,

          profilePhotoURL:
            visitorProfile.photoURL,

          ...getClientContext(),
        },
        {
          merge: true,
        }
      ),

      /* =========================
         PROFILE CONSENT
      ========================= */

      addDoc(
        collection(
          db,
          "profileConsents"
        ),
        {
          visitorId:
            currentVisitorId,

          sessionId:
            currentSessionId,

          authUid:
            visitorProfile.authUid,

          provider:
            visitorProfile.provider,

          displayName:
            visitorProfile.displayName,

          photoURL:
            visitorProfile.photoURL,

          createdAt:
            serverTimestamp(),

          ...getClientContext(),
        }
      ),
    ]);

    await trackPortfolioEvent(
      "anonymous_alias_saved",
      {
        provider:
          visitorProfile.provider,

        profileName:
          visitorProfile.displayName,

        profilePhotoURL:
          visitorProfile.photoURL,
      }
    );
  } catch (error) {
    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.warn(
        "Portfolio analytics profile attach failed",
        error
      );
    }
  }
};

/* =========================================================
   START TRACKING
========================================================= */

export const startPortfolioTracking =
  async () => {
    if (
      !canTrack() ||
      started
    ) {
      return {
        enabled:
          canTrack(),

        visitorId:
          currentVisitorId,

        sessionId:
          currentSessionId,
      };
    }

    ensureIds();

    started = true;

    // Lấy IP
    const ipContext =
      await getPortfolioIpContext();

    // Lấy toàn bộ browser + IP + location
    const clientContext = {
      ...getClientContext(),

      ...ipContext,

      ...getCachedLocationContext(),
    };

    const now =
      serverTimestamp();

    try {
      await Promise.all([
        /* =========================
           VISITOR
        ========================= */

        setDoc(
          doc(
            db,
            "visitors",
            currentVisitorId
          ),
          {
            visitorId:
              currentVisitorId,

            firstSeenAt:
              new Date(
                currentVisitorCreatedAt
              ),

            lastSeenAt:
              now,

            lastSessionId:
              currentSessionId,

            onlineWindowMs:
              ONLINE_WINDOW_MS,

            ...clientContext,
          },
          {
            merge: true,
          }
        ),

        /* =========================
           SESSION
        ========================= */

        setDoc(
          doc(
            db,
            "sessions",
            currentSessionId
          ),
          {
            sessionId:
              currentSessionId,

            visitorId:
              currentVisitorId,

            startedAt:
              new Date(
                currentSessionCreatedAt
              ),

            lastSeenAt:
              now,

            isActive:
              true,

            onlineWindowMs:
              ONLINE_WINDOW_MS,

            ...clientContext,

            ...getProfileContext(),
          },
          {
            merge: true,
          }
        ),
      ]);

      // page_view sẽ tự lấy location
      await trackPortfolioEvent(
        "page_view"
      );
    } catch (error) {
      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        console.warn(
          "Portfolio analytics start failed",
          error
        );
      }
    }

    return {
      enabled: true,

      visitorId:
        currentVisitorId,

      sessionId:
        currentSessionId,
    };
  };

/* =========================================================
   HEARTBEAT
========================================================= */

export const heartbeatPortfolioSession =
  async () => {
    if (
      !canTrack() ||
      !currentVisitorId ||
      !currentSessionId
    ) {
      return;
    }

    try {
      const lastSeenAt =
        serverTimestamp();

      await Promise.all([
        /* =========================
           VISITOR HEARTBEAT
        ========================= */

        setDoc(
          doc(
            db,
            "visitors",
            currentVisitorId
          ),
          {
            visitorId:
              currentVisitorId,

            firstSeenAt:
              new Date(
                currentVisitorCreatedAt ||
                  Date.now()
              ),

            lastSeenAt,

            lastSessionId:
              currentSessionId,

            onlineWindowMs:
              ONLINE_WINDOW_MS,

            ...getBaseContext(),

            ...getCachedIpContext(),

            ...getCachedLocationContext(),

            ...getProfileContext(),
          },
          {
            merge: true,
          }
        ),

        /* =========================
           SESSION HEARTBEAT
        ========================= */

        setDoc(
          doc(
            db,
            "sessions",
            currentSessionId
          ),
          {
            sessionId:
              currentSessionId,

            visitorId:
              currentVisitorId,

            startedAt:
              new Date(
                currentSessionCreatedAt ||
                  Date.now()
              ),

            lastSeenAt,

            isActive:
              true,

            onlineWindowMs:
              ONLINE_WINDOW_MS,

            ...getBaseContext(),

            ...getCachedIpContext(),

            ...getCachedLocationContext(),

            ...getProfileContext(),
          },
          {
            merge: true,
          }
        ),
      ]);
    } catch (error) {
      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        console.warn(
          "Portfolio analytics heartbeat failed",
          error
        );
      }
    }
  };

/* =========================================================
   STOP SESSION
========================================================= */

export const stopPortfolioSession =
  async () => {
    if (
      !canTrack() ||
      !currentSessionId
    ) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "sessions",
          currentSessionId
        ),
        {
          isActive: false,

          endedAt:
            serverTimestamp(),

          lastSeenAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        console.warn(
          "Portfolio analytics stop failed",
          error
        );
      }
    }
  };