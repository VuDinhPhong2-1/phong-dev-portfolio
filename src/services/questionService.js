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
import { getPortfolioIpContext, trackPortfolioEvent } from "./analyticsTracker";

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

export const submitAnonymousQuestion = async ({ alias, contact, question }) => {
  if (!canUseQuestions()) {
    throw new Error("Firebase is not configured.");
  }

  const cleanAlias = cleanText(alias, 40) || "Nguoi hoi an danh";
  const cleanContact = cleanText(contact, 80);
  const cleanQuestion = cleanText(question, 600);

  if (!cleanContact) {
    throw new Error("Ban nhap email hoac so dien thoai de nhan cau tra loi nhe.");
  }

  if (!isValidContact(cleanContact)) {
    throw new Error("Email hoac so dien thoai chua dung dinh dang.");
  }

  if (!cleanQuestion) {
    throw new Error("Ban nhap cau hoi truoc nhe.");
  }

  const ipContext = await getPortfolioIpContext();

  const payload = {
    alias: cleanAlias,
    contact: cleanContact,
    question: cleanQuestion,
    status: "pending",
    answer: "",
    isPublic: false,
    createdAt: serverTimestamp(),
    answeredAt: null,
    url: window.location.href,
    referrer: document.referrer || "Direct",
    ...ipContext,
  };

  const result = await addDoc(collection(db, "questions"), payload);
  trackPortfolioEvent("anonymous_question_submitted", {
    questionId: result.id,
    profileName: cleanAlias,
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
    await deleteDoc(doc(db, "publicQuestions", questionId));
  }
};
