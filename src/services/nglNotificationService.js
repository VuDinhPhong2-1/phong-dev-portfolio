import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const STORAGE_KEY = "ngl_user_submitted_questions";

/**
 * Play a gentle celestial bell chime using Web Audio API.
 */
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);
  } catch (err) {
    console.debug("Audio chime skipped:", err);
  }
};

/**
 * Request Browser Notification permission.
 */
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
};

/**
 * Send a Browser System Notification.
 */
export const sendBrowserNotification = (title, body, options = {}) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        ...options,
      });
      n.onclick = () => {
        window.focus();
        if (window.location.hash !== "#/ngl") {
          window.location.hash = "#/ngl";
        }
      };
    } catch (e) {
      console.debug("Notification error:", e);
    }
  }
};

/**
 * Get all questions submitted from this browser.
 */
export const getUserQuestions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Save newly submitted question into local history.
 */
export const saveUserQuestion = ({ id, alias, question, tag }) => {
  try {
    const current = getUserQuestions();
    if (!current.some((q) => q.id === id)) {
      const item = {
        id,
        alias: alias || "Người hỏi ẩn danh",
        question,
        tag: tag || "NGL Anonymous",
        submittedAt: Date.now(),
        status: "pending",
        answer: "",
        isPublic: false,
        read: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current].slice(0, 30)));
    }
  } catch (err) {
    console.warn("Cannot save local question:", err);
  }
};

/**
 * Mark question read.
 */
export const markQuestionAsRead = (questionId) => {
  try {
    const current = getUserQuestions();
    const updated = current.map((q) => (q.id === questionId ? { ...q, read: true } : q));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Cannot mark question read:", err);
  }
};

/**
 * Subscribe to status updates for user's own submitted questions.
 */
export const subscribeToMyQuestions = (onQuestionsUpdated) => {
  if (!isFirebaseConfigured || !db) {
    onQuestionsUpdated?.(getUserQuestions());
    return () => {};
  }

  const unsubs = [];
  const currentList = getUserQuestions();

  currentList.forEach((localItem) => {
    if (localItem.status === "answered" && localItem.read) return;

    try {
      const docRef = doc(db, "questions", localItem.id);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        if (data.status === "answered" && data.answer) {
          const freshList = getUserQuestions();
          const target = freshList.find((q) => q.id === localItem.id);

          if (target && (target.status !== "answered" || target.answer !== data.answer)) {
            target.status = "answered";
            target.answer = data.answer;
            target.isPublic = Boolean(data.isPublic);
            target.answeredAt = Date.now();
            target.read = false;

            localStorage.setItem(STORAGE_KEY, JSON.stringify(freshList));
            playNotificationChime();
            sendBrowserNotification(
              "💬 Vũ Đình Phong đã trả lời câu hỏi của bạn!",
              `"${target.question.slice(0, 45)}..." -> "${data.answer.slice(0, 75)}..."`
            );
            onQuestionsUpdated?.([...freshList]);
          }
        }
      });
      unsubs.push(unsub);
    } catch (e) {
      console.debug("Subscription error on question doc:", e);
    }
  });

  onQuestionsUpdated?.(getUserQuestions());
  return () => unsubs.forEach((u) => u?.());
};
