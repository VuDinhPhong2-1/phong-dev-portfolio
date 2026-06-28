import React, { useEffect, useMemo, useState } from "react";
import {
  faArrowRightFromBracket,
  faChartLine,
  faDesktop,
  faEye,
  faGlobe,
  faLock,
  faMicrochip,
  faReply,
  faSignal,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../services/firebase";
import { isAdminEmail } from "../services/firebase";
import { answerAnonymousQuestion, subscribeAllQuestions } from "../services/questionService";

const ONLINE_WINDOW_MS = 45 * 1000;
const LIVE_TICK_MS = 5 * 1000;

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return new Date(value).getTime();
  return 0;
};

const formatDateTime = (value) => {
  const millis = toMillis(value);
  if (!millis) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
};

const getHostLabel = (referrer) => {
  if (!referrer || referrer === "Direct") return "Direct";

  try {
    return new URL(referrer).hostname.replace("www.", "");
  } catch {
    return referrer;
  }
};

const countBy = (items, key, fallback = "Unknown") =>
  items.reduce((accumulator, item) => {
    const value = item[key] || fallback;
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});

const toSortedEntries = (counts) =>
  Object.entries(counts).sort((first, second) => second[1] - first[1]);

const getVisitorDisplayName = (session) =>
  session.profileName || session.viewerLabel || session.visitorId || "Anonymous visitor";

const getVisitorInitial = (session) =>
  getVisitorDisplayName(session).charAt(0).toUpperCase();

const getDeviceLine = (session) =>
  [
    session.device,
    session.deviceModel && session.deviceModel !== session.device ? session.deviceModel : "",
    session.operatingSystem,
    session.browser,
  ]
    .filter(Boolean)
    .join(" / ") || "Unknown device";

function AdminAnalytics() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const [visitors, setVisitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [publicFlags, setPublicFlags] = useState({});
  const isAdminUser = isAdminEmail(user?.email);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthReady(true);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), LIVE_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user || !isAdminEmail(user.email) || !db) {
      return undefined;
    }

    const visitorsQuery = collection(db, "visitors");
    const sessionsQuery = query(
      collection(db, "sessions"),
      orderBy("lastSeenAt", "desc"),
      limit(160),
    );
    const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(120));
    const allEventsQuery = collection(db, "events");

    const unsubscribeVisitors = onSnapshot(visitorsQuery, (snapshot) => {
      setVisitors(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setErrorMessage(error.message));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setErrorMessage(error.message));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setErrorMessage(error.message));
    const unsubscribeAllEvents = onSnapshot(allEventsQuery, (snapshot) => {
      setAllEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setErrorMessage(error.message));
    const unsubscribeQuestions = subscribeAllQuestions(setQuestions, (error) => setErrorMessage(error.message));

    return () => {
      unsubscribeVisitors();
      unsubscribeSessions();
      unsubscribeEvents();
      unsubscribeAllEvents();
      unsubscribeQuestions();
    };
  }, [user]);

  const counts = useMemo(
    () => ({
      totalPageViews: allEvents.filter((event) => event.type === "page_view").length,
      totalVisitors: visitors.length,
      totalEvents: allEvents.length,
    }),
    [allEvents, visitors],
  );

  const activeSessions = useMemo(() => {
    const cutoff = now - ONLINE_WINDOW_MS;
    return sessions.filter((session) => session.isActive !== false && toMillis(session.lastSeenAt) > cutoff);
  }, [now, sessions]);

  const referrerRows = useMemo(
    () =>
      toSortedEntries(
        visitors.reduce((accumulator, visitor) => {
          const referrer = getHostLabel(visitor.referrer);
          accumulator[referrer] = (accumulator[referrer] || 0) + 1;
          return accumulator;
        }, {}),
      ).slice(0, 6),
    [visitors],
  );

  const deviceRows = useMemo(() => toSortedEntries(countBy(visitors, "device")).slice(0, 6), [visitors]);
  const browserRows = useMemo(
    () => toSortedEntries(countBy(visitors, "browser")).slice(0, 6),
    [visitors],
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerQuestion = async (item) => {
    setErrorMessage("");

    try {
      await answerAnonymousQuestion({
        questionId: item.id,
        alias: item.alias,
        question: item.question,
        answer: answers[item.id] ?? item.answer ?? "",
        isPublic: publicFlags[item.id] !== false,
      });
      setAnswers((current) => ({ ...current, [item.id]: "" }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h1>Firebase is not configured</h1>
          <p>
            Add your Firebase values to a local .env file using .env.example, then restart the
            React dev server.
          </p>
        </section>
      </main>
    );
  }

  if (!authReady) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <h1>Loading analytics...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h1>Portfolio Analytics</h1>
          <p>Sign in with your Firebase admin account to view private visitor activity.</p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!isAdminUser) {
    return (
      <main className="admin-page">
        <section className="admin-auth-panel">
          <div className="admin-icon">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h1>Admin access only</h1>
          <p>This account can submit visitor profile consent, but it cannot view private analytics.</p>
          <button type="button" className="button-primary admin-signout-full" onClick={() => signOut(auth)}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">Private dashboard</span>
            <span className="admin-live-badge">
              <span aria-hidden="true" />
              Live
            </span>
            <h1>Portfolio Analytics</h1>
            <p>{user.email}</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => signOut(auth)}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Sign out
          </button>
        </header>

        {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}

        <div className="analytics-grid">
          <article className="analytics-stat">
            <FontAwesomeIcon icon={faEye} />
            <span>Page views</span>
            <strong>{counts.totalPageViews}</strong>
          </article>
          <article className="analytics-stat">
            <FontAwesomeIcon icon={faUsers} />
            <span>Visitors</span>
            <strong>{counts.totalVisitors}</strong>
          </article>
          <article className="analytics-stat">
            <FontAwesomeIcon icon={faSignal} />
            <span>Online now</span>
            <strong>{activeSessions.length}</strong>
          </article>
          <article className="analytics-stat">
            <FontAwesomeIcon icon={faChartLine} />
            <span>Events</span>
            <strong>{counts.totalEvents}</strong>
          </article>
        </div>

        <div className="analytics-columns">
          <article className="analytics-panel">
            <h2>Online visitors</h2>
            <div className="visitor-list">
              {activeSessions.length ? (
                activeSessions.map((session) => (
                  <div className="visitor-row" key={session.id}>
                    <div className="visitor-profile">
                      {session.profilePhotoURL ? (
                        <img src={session.profilePhotoURL} alt={session.profileName || "Facebook visitor"} />
                      ) : (
                        <span className="visitor-avatar-fallback">
                          {getVisitorInitial(session)}
                        </span>
                      )}
                      <div>
                        <strong>{getVisitorDisplayName(session)}</strong>
                        <span>{session.profileName ? "Anonymous alias / " : ""}{getDeviceLine(session)}</span>
                        <small>
                          {session.viewport || session.screen || "Unknown screen"}
                          {session.timezone ? ` / ${session.timezone}` : ""}
                        </small>
                      </div>
                    </div>
                    <time>{formatDateTime(session.lastSeenAt)}</time>
                  </div>
                ))
              ) : (
                <p className="admin-empty">No active visitors in the last 2 minutes.</p>
              )}
            </div>
          </article>

          <article className="analytics-panel">
            <h2>Recent events</h2>
            <div className="event-list">
              {events.slice(0, 12).map((event) => (
                  <div className="event-row" key={event.id}>
                    <div>
                      <strong>{event.type}</strong>
                      <span>
                        {event.profileName ||
                          event.section ||
                          event.channel ||
                          event.project ||
                          event.path ||
                          "Portfolio"}
                      </span>
                    </div>
                  <time>{formatDateTime(event.createdAt)}</time>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="analytics-columns analytics-columns-compact">
          <article className="analytics-panel">
            <h2>
              <FontAwesomeIcon icon={faGlobe} />
              Referrers
            </h2>
            {referrerRows.map(([label, value]) => (
              <div className="breakdown-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </article>

          <article className="analytics-panel">
            <h2>
              <FontAwesomeIcon icon={faDesktop} />
              Devices
            </h2>
            {deviceRows.map(([label, value]) => (
              <div className="breakdown-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </article>

          <article className="analytics-panel">
            <h2>Browsers</h2>
            {browserRows.map(([label, value]) => (
              <div className="breakdown-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </article>
        </div>

        <article className="analytics-panel analytics-device-panel">
          <h2>
            <FontAwesomeIcon icon={faMicrochip} />
            Live device details
          </h2>
          <div className="device-detail-grid">
            {activeSessions.length ? (
              activeSessions.map((session) => (
                <div className="device-detail-card" key={`${session.id}-device`}>
                  <strong>{getVisitorDisplayName(session)}</strong>
                  <dl>
                    <div>
                      <dt>OS</dt>
                      <dd>{session.operatingSystem || "Unknown"}</dd>
                    </div>
                    <div>
                      <dt>Model</dt>
                      <dd>{session.deviceModel || session.platform || "Unknown"}</dd>
                    </div>
                    <div>
                      <dt>CPU / RAM</dt>
                      <dd>
                        {session.hardwareConcurrency || "?"} cores
                        {session.deviceMemory ? ` / ${session.deviceMemory} GB` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Screen</dt>
                      <dd>{session.screen || "Unknown"} @ {session.pixelRatio || 1}x</dd>
                    </div>
                    <div>
                      <dt>Touch</dt>
                      <dd>{session.maxTouchPoints || 0} points</dd>
                    </div>
                    <div>
                      <dt>Network</dt>
                      <dd>{session.networkEffectiveType || "Unknown"}</dd>
                    </div>
                  </dl>
                </div>
              ))
            ) : (
              <p className="admin-empty">No live device details yet.</p>
            )}
          </div>
        </article>

        <article className="analytics-panel admin-question-panel">
          <h2>
            <FontAwesomeIcon icon={faReply} />
            Anonymous questions
          </h2>
          <div className="admin-question-list">
            {questions.length ? (
              questions.map((item) => (
                <div className="admin-question-card" key={item.id}>
                  <div className="admin-question-meta">
                    <strong>{item.alias || "Người hỏi ẩn danh"}</strong>
                    <span className={item.status === "answered" ? "question-status answered" : "question-status"}>
                      {item.status === "answered" ? "Answered" : "Pending"}
                    </span>
                  </div>
                  <p>{item.question}</p>
                  {item.answer ? <blockquote>{item.answer}</blockquote> : null}
                  <textarea
                    value={answers[item.id] ?? item.answer ?? ""}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    placeholder="Write your answer..."
                    rows={3}
                  />
                  <div className="admin-question-actions">
                    <label>
                      <input
                        type="checkbox"
                        checked={publicFlags[item.id] !== false}
                        onChange={(event) =>
                          setPublicFlags((current) => ({ ...current, [item.id]: event.target.checked }))
                        }
                      />
                      Public answer
                    </label>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={() => handleAnswerQuestion(item)}
                    >
                      Save answer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-empty">No anonymous questions yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default AdminAnalytics;
