import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  getCurrentSessionId,
  getCurrentVisitorId,
  getPortfolioIpContext,
  getSenderDeviceSummary,
  getSenderFingerprint,
  trackPortfolioEvent,
} from "./analyticsTracker";
import { saveUserQuestion } from "./nglNotificationService";
import { sendQuestionEmailNotification } from "./emailNotificationService";

const canUseQuestions = () => isFirebaseConfigured && db;

const cleanText = (value, maxLength) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);

const isValidContact = (value) => {
  const normalized = String(value || "").trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\d\s.-]{8,20}$/;

  return emailPattern.test(normalized) || phonePattern.test(normalized);
};

export const submitAnonymousQuestion = async ({
  alias,
  contact,
  question,
  tag,
  keepPrivate = false,
}) => {
  if (!canUseQuestions()) {
    throw new Error("Firebase chưa được cấu hình.");
  }

  const cleanAlias = cleanText(alias, 40) || "Người hỏi ẩn danh";
  const cleanContact = cleanText(contact, 80);
  const cleanQuestion = cleanText(question, 600);
  const cleanTag = cleanText(tag, 40) || "NGL Anonymous";
  const isPrivate = Boolean(keepPrivate);

  // Contact is optional for true NGL experience. Only validate if user typed something.
  if (cleanContact && !isValidContact(cleanContact)) {
    throw new Error("Email hoặc số điện thoại chưa đúng định dạng.");
  }

  if (!cleanQuestion) {
    throw new Error("Bạn hãy nhập câu hỏi trước nhé.");
  }

  const ipContext = await getPortfolioIpContext();
  const visitorId = getCurrentVisitorId();
  const sessionId = getCurrentSessionId();
  const deviceSummary = getSenderDeviceSummary();
  const deviceFingerprint = getSenderFingerprint();

  const payload = {
    alias: cleanAlias,
    contact: cleanContact || "Ẩn danh (Không để lại liên hệ)",
    question: cleanQuestion,
    tag: cleanTag,
    keepPrivate: isPrivate,
    status: "pending",
    answer: "",
    isPublic: false,
    createdAt: serverTimestamp(),
    answeredAt: null,
    url: window.location.href,
    referrer: document.referrer || "Direct",
    visitorId: visitorId || "unknown_visitor",
    sessionId: sessionId || "unknown_session",
    deviceSummary: deviceSummary || "Unknown device",
    deviceFingerprint: deviceFingerprint || "fp_unknown",
    ...ipContext,
  };

  const result = await addDoc(collection(db, "questions"), payload);
  saveUserQuestion({
    id: result.id,
    alias: cleanAlias,
    question: cleanQuestion,
    tag: cleanTag,
    keepPrivate: isPrivate,
  });

  // Tự động gửi thông báo Email đến vudinhphong.26001@gmail.com
  sendQuestionEmailNotification({
    id: result.id,
    alias: cleanAlias,
    question: cleanQuestion,
    contact: cleanContact,
    tag: cleanTag,
    keepPrivate: isPrivate,
    ipContext: {
      ...ipContext,
      device: deviceSummary,
    },
  }).catch((emailError) => {
    console.warn("Gửi email thông báo thất bại:", emailError);
  });

  trackPortfolioEvent("anonymous_question_submitted", {
    questionId: result.id,
    profileName: cleanAlias,
    tag: cleanTag,
    keepPrivate: isPrivate,
    visitorId,
  });

  return result.id;
};

export const subscribeAnsweredQuestions = (onNext, onError) => {
  if (!canUseQuestions()) {
    onNext([]);
    return () => {};
  }

  const questionsQuery = query(collection(db, "publicQuestions"), orderBy("answeredAt", "desc"));

  return onSnapshot(
    questionsQuery,
    (snapshot) => onNext(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
};

export const subscribeAllQuestions = (onNext, onError) => {
  if (!canUseQuestions()) {
    onNext([]);
    return () => {};
  }

  const questionsQuery = query(collection(db, "questions"), orderBy("createdAt", "desc"));

  return onSnapshot(
    questionsQuery,
    (snapshot) => onNext(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
};

export const answerAnonymousQuestion = async ({
  questionId,
  alias,
  question,
  answer,
  isPublic,
}) => {
  if (!canUseQuestions()) {
    throw new Error("Firebase is not configured.");
  }

  const cleanAnswer = cleanText(answer, 1200);
  if (!cleanAnswer) {
    throw new Error("Nhap cau tra loi truoc nhe.");
  }

  const answeredAt = serverTimestamp();

  await updateDoc(doc(db, "questions", questionId), {
    answer: cleanAnswer,
    isPublic: Boolean(isPublic),
    status: "answered",
    answeredAt,
  });

  if (isPublic) {
    await setDoc(
      doc(db, "publicQuestions", questionId),
      {
        questionId,
        alias: alias || "Nguoi hoi an danh",
        question: question || "",
        answer: cleanAnswer,
        isPublic: true,
        answeredAt: serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    await deleteDoc(doc(db, "publicQuestions", questionId)).catch(() => {});
  }
};

/**
 * Toggle public status of a question without rewriting answer
 */
export const toggleQuestionPublic = async (questionId, isPublic, questionData = {}) => {
  if (!canUseQuestions()) return;

  await updateDoc(doc(db, "questions", questionId), {
    isPublic: Boolean(isPublic),
  });

  if (isPublic) {
    await setDoc(
      doc(db, "publicQuestions", questionId),
      {
        questionId,
        alias: questionData.alias || "Người hỏi ẩn danh",
        question: questionData.question || "",
        answer: questionData.answer || "",
        tag: questionData.tag || "NGL Anonymous",
        isPublic: true,
        answeredAt: questionData.answeredAt || serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    await deleteDoc(doc(db, "publicQuestions", questionId)).catch(() => {});
  }
};

/**
 * Update question status (e.g. 'pending', 'answered', 'starred', 'spam')
 */
export const updateQuestionStatus = async (questionId, status) => {
  if (!canUseQuestions()) return;
  await updateDoc(doc(db, "questions", questionId), {
    status,
  });
};

/**
 * Delete a question completely from both questions and publicQuestions
 */
export const deleteAnonymousQuestion = async (questionId) => {
  if (!canUseQuestions()) return;

  await Promise.allSettled([
    deleteDoc(doc(db, "questions", questionId)),
    deleteDoc(doc(db, "publicQuestions", questionId)),
  ]);
};

/**
 * Create a new Question/Announcement directly by Admin
 */
export const createQuestionByAdmin = async ({
  alias = "Admin",
  question,
  answer = "",
  tag = "Thông báo",
  isPublic = true,
}) => {
  if (!canUseQuestions()) {
    throw new Error("Firebase chưa được cấu hình.");
  }

  const cleanQuestion = cleanText(question, 600);
  if (!cleanQuestion) {
    throw new Error("Vui lòng nhập nội dung câu hỏi/thông báo.");
  }

  const cleanAnswer = cleanText(answer, 1200);

  const payload = {
    alias: cleanText(alias, 40) || "Admin",
    contact: "Quản trị viên",
    question: cleanQuestion,
    answer: cleanAnswer,
    tag: cleanText(tag, 40) || "Thông báo",
    keepPrivate: false,
    status: cleanAnswer ? "answered" : "pending",
    isPublic: Boolean(isPublic),
    createdAt: serverTimestamp(),
    answeredAt: cleanAnswer ? serverTimestamp() : null,
    url: window.location.href,
    referrer: "Admin Dashboard",
    visitorId: "admin_author",
    sessionId: "admin_session",
    deviceSummary: "Admin Dashboard",
  };

  const result = await addDoc(collection(db, "questions"), payload);

  if (isPublic && cleanAnswer) {
    await setDoc(doc(db, "publicQuestions", result.id), {
      questionId: result.id,
      alias: payload.alias,
      question: cleanQuestion,
      answer: cleanAnswer,
      tag: payload.tag,
      isPublic: true,
      answeredAt: serverTimestamp(),
    });
  }

  return result.id;
};

/* =========================================================
   SENDER NOTES (Internal admin notes for identified visitors)
========================================================= */

export const saveSenderAdminNote = async (senderKey, note) => {
  if (!canUseQuestions() || !senderKey) return;
  await setDoc(
    doc(db, "senderNotes", senderKey),
    {
      senderKey,
      note: String(note || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const subscribeSenderNotes = (onNext, onError) => {
  if (!canUseQuestions()) {
    onNext({});
    return () => {};
  }

  return onSnapshot(
    collection(db, "senderNotes"),
    (snapshot) => {
      const map = {};
      snapshot.docs.forEach((d) => {
        map[d.id] = d.data().note || "";
      });
      onNext(map);
    },
    onError,
  );
};

/* =========================================================
   NGL PROMPTS CRUD (Dynamic random prompts for NGL page)
========================================================= */

export const subscribeNglPrompts = (onNext, onError) => {
  if (!canUseQuestions()) {
    onNext([]);
    return () => {};
  }

  const promptsQuery = query(collection(db, "nglPrompts"), orderBy("createdAt", "desc"));

  return onSnapshot(
    promptsQuery,
    (snapshot) => {
      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      onNext(list);
    },
    onError,
  );
};

export const addNglPrompt = async (promptText) => {
  if (!canUseQuestions()) return null;
  const clean = cleanText(promptText, 250);
  if (!clean) throw new Error("Nội dung gợi ý không được để trống.");

  const docRef = await addDoc(collection(db, "nglPrompts"), {
    text: clean,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateNglPrompt = async (promptId, promptText) => {
  if (!canUseQuestions()) return;
  const clean = cleanText(promptText, 250);
  if (!clean) throw new Error("Nội dung gợi ý không được để trống.");

  await updateDoc(doc(db, "nglPrompts", promptId), {
    text: clean,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNglPrompt = async (promptId) => {
  if (!canUseQuestions()) return;
  await deleteDoc(doc(db, "nglPrompts", promptId));
};
