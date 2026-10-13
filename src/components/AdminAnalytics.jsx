import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCogs,
  faLightbulb,
  faMicrochip,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db, isAdminEmail, isFirebaseConfigured } from "../services/firebase";
import {
  subscribeAllQuestions,
  subscribeNglPrompts,
  subscribeSenderNotes,
} from "../services/questionService";
import { playNotificationChime, sendBrowserNotification } from "../services/nglNotificationService";
import "../admin.css";

import AdminTopbar from "./admin/AdminTopbar";
import AdminLoginView from "./admin/AdminLoginView";
import AdminQuestionsTab from "./admin/AdminQuestionsTab";
import AdminPromptsTab from "./admin/AdminPromptsTab";
import AdminLiveDevicesTab from "./admin/AdminLiveDevicesTab";
import AdminAnalyticsTab from "./admin/AdminAnalyticsTab";
import AdminSettingsTab from "./admin/AdminSettingsTab";
import NglStoryModal from "./NglStoryModal";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export default function AdminAnalytics() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [senderNotes, setSenderNotes] = useState({});
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [visitors, setVisitors] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [toasts, setToasts] = useState([]);
  const [storyItem, setStoryItem] = useState(null);

  const knownQuestionIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast notification system
  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Auth listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAdminUser = Boolean(user && isAdminEmail(user.email));

  // Realtime Subscriptions
  useEffect(() => {
    if (!isAdminUser || !db) return;

    // 1. Questions
    const unsubQuestions = subscribeAllQuestions((list) => {
      setQuestions(list || []);

      if (!isInitialLoadRef.current) {
        const newItems = (list || []).filter((q) => !knownQuestionIdsRef.current.has(q.id));
        if (newItems.length > 0) {
          playNotificationChime();
          sendBrowserNotification("💌 Có tin nhắn ẩn danh mới!", {
            body: `${newItems[0].alias}: "${newItems[0].question.slice(0, 60)}..."`,
          });
          showToast(`💌 Tin nhắn mới từ ${newItems[0].alias}!`);
        }
      }

      (list || []).forEach((q) => knownQuestionIdsRef.current.add(q.id));
      isInitialLoadRef.current = false;
    });

    // 2. Sender Notes
    const unsubNotes = subscribeSenderNotes((map) => {
      setSenderNotes(map || {});
    });

    // 3. Dynamic Prompts
    const unsubPrompts = subscribeNglPrompts((list) => {
      setPrompts(list || []);
    });

    // 4. Sessions
    const sessionsQuery = query(
      collection(db, "sessions"),
      orderBy("lastSeenAt", "desc"),
      limit(60)
    );
    const unsubSessions = onSnapshot(sessionsQuery, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // 5. Visitors
    const visitorsQuery = query(
      collection(db, "visitors"),
      orderBy("lastSeenAt", "desc"),
      limit(60)
    );
    const unsubVisitors = onSnapshot(visitorsQuery, (snap) => {
      setVisitors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // 6. Events
    const eventsQuery = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      limit(80)
    );
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubQuestions?.();
      unsubNotes?.();
      unsubPrompts?.();
      unsubSessions?.();
      unsubVisitors?.();
      unsubEvents?.();
    };
  }, [isAdminUser]);

  // Online active sessions
  const activeSessions = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      const time = s.lastSeenAt?.toMillis ? s.lastSeenAt.toMillis() : new Date(s.lastSeenAt || 0).getTime();
      return now - time <= ONLINE_WINDOW_MS;
    });
  }, [sessions]);

  const pendingQuestionsCount = useMemo(
    () => questions.filter((q) => q.status !== "answered").length,
    [questions]
  );

  if (!user || !isAdminUser || !authReady || !isFirebaseConfigured) {
    return (
      <AdminLoginView
        user={user}
        isAdminUser={isAdminUser}
        authReady={authReady}
      />
    );
  }

  return (
    <div className="adm-dashboard-root">
      <AdminTopbar
        currentTime={currentTime}
        onSignOut={() => signOut(auth)}
      />

      <div className="adm-nav-container">
        <nav className="adm-tabs-row">
          <button
            type="button"
            className={`adm-tab-button ${activeTab === "questions" ? "is-active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            <FontAwesomeIcon icon={faReply} />
            Hộp thư Ẩn danh & Q&A
            {pendingQuestionsCount > 0 ? (
              <span className="adm-tab-pill is-danger">{pendingQuestionsCount}</span>
            ) : (
              <span className="adm-tab-pill">{questions.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`adm-tab-button ${activeTab === "prompts" ? "is-active" : ""}`}
            onClick={() => setActiveTab("prompts")}
          >
            <FontAwesomeIcon icon={faLightbulb} />
            Gợi ý Prompts ({prompts.length})
          </button>

          <button
            type="button"
            className={`adm-tab-button ${activeTab === "live" ? "is-active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            <FontAwesomeIcon icon={faMicrochip} />
            Khách Realtime
            <span className="adm-tab-pill is-success">{activeSessions.length} online</span>
          </button>

          <button
            type="button"
            className={`adm-tab-button ${activeTab === "analytics" ? "is-active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FontAwesomeIcon icon={faChartLine} />
            Thống kê & Báo cáo
          </button>

          <button
            type="button"
            className={`adm-tab-button ${activeTab === "settings" ? "is-active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FontAwesomeIcon icon={faCogs} />
            Cài đặt & Tiện ích
          </button>
        </nav>
      </div>

      <main className="adm-content-container">
        {activeTab === "questions" && (
          <AdminQuestionsTab
            questions={questions}
            senderNotes={senderNotes}
            showToast={showToast}
            onOpenStory={(item) => setStoryItem(item)}
          />
        )}

        {activeTab === "prompts" && (
          <AdminPromptsTab
            prompts={prompts}
            showToast={showToast}
          />
        )}

        {activeTab === "live" && (
          <AdminLiveDevicesTab
            sessions={sessions}
            activeSessions={activeSessions}
          />
        )}

        {activeTab === "analytics" && (
          <AdminAnalyticsTab
            visitors={visitors}
            sessions={sessions}
            events={events}
          />
        )}

        {activeTab === "settings" && (
          <AdminSettingsTab
            questions={questions}
            showToast={showToast}
          />
        )}
      </main>

      <div className="adm-toast-container">
        {toasts.map((t) => (
          <div className="adm-toast" key={t.id}>
            {t.message}
          </div>
        ))}
      </div>

      {storyItem && (
        <NglStoryModal
          item={storyItem}
          onClose={() => setStoryItem(null)}
        />
      )}
    </div>
  );
}


