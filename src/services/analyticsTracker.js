import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db, isFirebaseConfigured } from "./firebase";
import {
  getPersistentItem,
  readOrCreatePersistentItem,
  setPersistentItem,
} from "../utils/persistentStorage";
import { sendHotLeadTelegramNotification } from "./telegramNotificationService";

const VISITOR_ID_KEY = "portfolio_visitor_id";
const VISITOR_CREATED_AT_KEY = "portfolio_visitor_created_at";
const VISITOR_COUNT_KEY = "portfolio_visit_count";
const INTEREST_SCORE_KEY = "portfolio_interest_score";

const SESSION_ID_KEY = "portfolio_session_id";
const SESSION_CREATED_AT_KEY = "portfolio_session_created_at";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

let currentVisitorId = null;
let currentSessionId = null;

let currentVisitorCreatedAt = null;
let currentSessionCreatedAt = null;

let currentVisitorProfile = null;
let currentVisitCount = 1;
let currentInterestScore = 0;
let currentSessionIsNew = false;

const INTEREST_EVENT_KEY = "portfolio_interest_events";

export const INTEREST_LEVELS = {
  hot: { min: 65, label: "Rất quan tâm", icon: "🔥" },
  engaged: { min: 35, label: "Khá quan tâm", icon: "⚡" },
  casual: { min: 0, label: "Ghé xem", icon: "👀" },
};

export const getInterestLevel = (score = 0) => {
  if (score >= INTEREST_LEVELS.hot.min) return "hot";
  if (score >= INTEREST_LEVELS.engaged.min) return "engaged";
  return "casual";
};

export const getCurrentInterestScore = () => currentInterestScore;

const getScoringRule = (type, metadata = {}) => {
  const section = String(metadata.section || "").toLowerCase();
  const channel = String(metadata.channel || "").toLowerCase();

  if (type === "page_view") return { points: 5, key: "page_view" };
  if (type === "section_dwell" && section === "about" && Number(metadata.durationSeconds) >= 30) {
    return { points: 15, key: "about_dwell_30" };
  }
  if (type === "section_view" && ["experience", "projects"].includes(section)) {
    return { points: 10, key: `section_${section}` };
  }
  if (type === "scroll_depth" && Number(metadata.depth) >= 75) {
    return { points: 10, key: "scroll_75" };
  }
  if (type === "cv_download") return { points: 25, key: "cv_download" };
  if (
    type === "contact_click" &&
    ["email", "phone", "điện", "zalo"].some((value) => channel.includes(value))
  ) {
    return { points: 20, key: `contact_${channel || "direct"}` };
  }
  if (type === "text_copy" && metadata.context === "contact") {
    return { points: 20, key: "contact_copy" };
  }
  if (["floating_bubble_click", "header_ngl_click"].includes(type)) {
    return { points: 15, key: "open_ngl" };
  }
  if (type === "anonymous_question_submitted") {
    return { points: 30, key: "ngl_submitted" };
  }
  if (type === "return_visit") {
    const visitCount = Number(metadata.visitCount) || 1;
    return { points: visitCount >= 3 ? 25 : 15, key: `return_visit_${visitCount}` };
  }
  return { points: 0, key: "" };
};

const takeScoreOncePerSession = (rule) => {
  if (!rule.points || !rule.key || typeof sessionStorage === "undefined") return 0;
  try {
    const applied = new Set(JSON.parse(sessionStorage.getItem(INTEREST_EVENT_KEY) || "[]"));
    if (applied.has(rule.key)) return 0;
    applied.add(rule.key);
    sessionStorage.setItem(INTEREST_EVENT_KEY, JSON.stringify([...applied]));
    return rule.points;
  } catch {
    return rule.points;
  }
};

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
  !window.location.hash.startsWith("#/admin-analytics") &&
  !window.location.hash.startsWith("#/admin");

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

      const ipAddress = String(data.ipAddress || "").trim();
      const latitude = data.latitude === null || data.latitude === "" ? null : Number(data.latitude);
      const longitude = data.longitude === null || data.longitude === "" ? null : Number(data.longitude);

      currentIpContext = {
        ...(ipAddress ? { ipAddress } : {}),
        city: String(data.city || "").trim() || null,
        region: String(data.region || "").trim() || null,
        country: String(data.country || "").trim() || null,
        latitude: latitude !== null && Number.isFinite(latitude) ? latitude : null,
        longitude: longitude !== null && Number.isFinite(longitude) ? longitude : null,
        locationSource: data.locationSource || "vercel_ip_headers",
      };

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
export const setCachedLocationContext = (location) => {
  if (!location) {
    currentLocationContext = {};
    return;
  }

  currentLocationContext = {
    latitude:
      typeof location.latitude === "number"
        ? location.latitude
        : null,

    longitude:
      typeof location.longitude === "number"
        ? location.longitude
        : null,

    accuracy:
      typeof location.accuracy === "number"
        ? location.accuracy
        : null,

    address: location.address || null,
    road: location.road || null,
    ward: location.ward || null,
    district: location.district || null,
    city: location.city || null,
    country: location.country || null,

    locationSource: "browser_geolocation",
  };
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
  platform: navigator.platform || "Unknown",
  vendor: navigator.vendor || "Unknown",

  language: navigator.language || "Unknown",
  languages: Array.isArray(navigator.languages)
    ? navigator.languages.join(", ")
    : "",

  screen: `${window.screen.width}x${window.screen.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`,

  colorDepth: window.screen.colorDepth || null,
  pixelRatio: window.devicePixelRatio || 1,
  hardwareConcurrency: navigator.hardwareConcurrency || null,
  deviceMemory: navigator.deviceMemory || null,
  maxTouchPoints: navigator.maxTouchPoints || 0,

  cookiesEnabled: navigator.cookieEnabled,
  doNotTrack:
    navigator.doNotTrack ||
    window.doNotTrack ||
    "unspecified",

  timezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Unknown",

  userAgent: navigator.userAgent,

  ...getNetworkContext(),

  // ⭐ LOCATION
  ...currentLocationContext,
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
  currentVisitorId = readOrCreatePersistentItem(
    VISITOR_ID_KEY,
    () => createId("visitor")
  );

  currentVisitorCreatedAt = readOrCreatePersistentItem(
    VISITOR_CREATED_AT_KEY,
    () => new Date().toISOString()
  );

  const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!currentSessionId) {
    currentSessionIsNew = !existingSessionId;
  }

  currentSessionId = readOrCreateLocalValue(
    sessionStorage,
    SESSION_ID_KEY,
    () => createId("session")
  );

  const storedVisitCount = Math.max(0, Number(getPersistentItem(VISITOR_COUNT_KEY)) || 0);
  currentInterestScore = Math.max(0, Number(getPersistentItem(INTEREST_SCORE_KEY)) || 0);
  currentVisitCount = existingSessionId ? Math.max(1, storedVisitCount) : storedVisitCount + 1;
  if (!existingSessionId) {
    setPersistentItem(VISITOR_COUNT_KEY, String(currentVisitCount));
  }

  currentSessionCreatedAt =
    readOrCreateLocalValue(
      sessionStorage,
      SESSION_CREATED_AT_KEY,
      () => new Date().toISOString()
    );
};

export const getCurrentVisitorId = () => {
  if (!currentVisitorId) {
    ensureIds();
  }
  return currentVisitorId;
};

export const getCurrentSessionId = () => {
  if (!currentSessionId) {
    ensureIds();
  }
  return currentSessionId;
};

export const getSenderDeviceSummary = () => {
  if (typeof window === "undefined") return "Unknown device";
  const os = getOperatingSystem();
  const browser = getBrowserName();
  const screenRes =
    typeof window.screen !== "undefined"
      ? `${window.screen.width}x${window.screen.height}`
      : "";
  const tz =
    typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions()?.timeZone || ""
      : "";
  return `${os} • ${browser}${screenRes ? ` (${screenRes})` : ""}${tz ? ` • ${tz}` : ""}`;
};

export const getSenderFingerprint = () => {
  // Backwards-compatible sender key without passive browser fingerprinting.
  // The random visitor ID is already disclosed in the privacy page and can be reset by the visitor.
  return currentVisitorId ? `vid_${currentVisitorId}` : "fp_none";
};

/* =========================================================
   ACTION FORMATTER
========================================================= */

export const formatActionSummary = (type, metadata = {}) => {
  switch (type) {
    case "page_view":
      return "Truy cập trang";
    case "section_view":
      return `Xem mục: ${metadata.section || "chưa rõ"}`;
    case "section_dwell":
      return `Dừng đọc ${metadata.section || "mục"} (${metadata.durationSeconds || 0}s)`;
    case "scroll_depth":
      return `Cuộn trang: ${metadata.depth || 0}%`;
    case "cv_download":
      return `Tải CV (${metadata.source || "trang"})`;
    case "github_click":
      return `Xem Github (${metadata.source || metadata.project || "link"})`;
    case "contact_click":
      return `Bấm liên hệ: ${metadata.channel || metadata.company || "kênh"}`;
    case "project_click":
      return `Xem dự án: ${metadata.project || metadata.source || "dự án"}`;
    case "floating_bubble_click":
      return "Bấm bong bóng Messenger";
    case "floating_bubble_dismiss":
      return "Đóng bong bóng Messenger";
    case "header_ngl_click":
      return "Bấm Hỏi ẩn danh (Header)";
    case "nav_click":
      return `Điều hướng menu: ${metadata.tab || "tab"}`;
    case "language_change":
      return `Đổi ngôn ngữ: ${metadata.from} ➔ ${metadata.to}`;
    case "text_copy":
      return `Sao chép: "${(metadata.textSnippet || "").slice(0, 30)}..."`;
    case "skill_badge_click":
      return `Xem kỹ năng: ${metadata.skill || "skill"}`;
    case "anonymous_alias_saved":
      return `Đặt biệt danh: ${metadata.alias || "ẩn danh"}`;
    case "anonymous_alias_skipped":
      return "Bỏ qua đặt biệt danh";
    case "anonymous_question_submitted":
      return `Gửi câu hỏi NGL: ${metadata.profileName || "ẩn danh"}`;
    case "return_visit":
      return `Quay lại portfolio lần ${metadata.visitCount || 2}`;
    default:
      return type.replace(/_/g, " ");
  }
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
    const actionLabel = formatActionSummary(type, metadata);
    const scoreDelta = takeScoreOncePerSession(getScoringRule(type, metadata));
    if (scoreDelta > 0) {
      const previousScore = currentInterestScore;
      currentInterestScore += scoreDelta;
      setPersistentItem(INTEREST_SCORE_KEY, String(currentInterestScore));
      if (previousScore < INTEREST_LEVELS.hot.min && currentInterestScore >= INTEREST_LEVELS.hot.min) {
        sendHotLeadTelegramNotification({
          score: currentInterestScore,
          action: actionLabel,
          ipContext: getCachedIpContext(),
          device: getSenderDeviceSummary(),
        }).catch(() => {});
      }
    }

    await addDoc(
      collection(db, "events"),
      {
        type,
        actionLabel,

        visitorId:
          currentVisitorId,

        sessionId:
          currentSessionId,

        createdAt:
          serverTimestamp(),

        scoreDelta,

        ...getClientContext(),

        ...getProfileContext(),

        ...metadata,
      }
    );

    const sessionUpdates = {
      lastAction: actionLabel,
      lastActionType: type,
      lastActionAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };

    if (type === "scroll_depth" && typeof metadata.depth === "number") {
      sessionUpdates.maxScrollDepth = metadata.depth;
    }

    if (scoreDelta > 0) {
      sessionUpdates.interestScore = increment(scoreDelta);
      sessionUpdates.lastScoreDelta = scoreDelta;
    }

    const scoreWrites = [
      setDoc(doc(db, "sessions", currentSessionId), sessionUpdates, { merge: true }),
    ];

    if (scoreDelta > 0) {
      scoreWrites.push(
        setDoc(
          doc(db, "visitors", currentVisitorId),
          {
            visitorId: currentVisitorId,
            interestScore: increment(scoreDelta),
            lastScoreAt: serverTimestamp(),
          },
          { merge: true }
        )
      );
    }

    Promise.all(scoreWrites).catch(() => {});
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

            visitCount: currentVisitCount,

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

            visitNumber: currentVisitCount,

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

      if (currentSessionIsNew && currentVisitCount >= 2) {
        await trackPortfolioEvent("return_visit", { visitCount: currentVisitCount });
      }

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
