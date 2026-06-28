import React, { useEffect, useMemo, useState } from "react";
import {
  faArrowRightFromBracket,
  faChartLine,
  faDesktop,
  faEye,
  faGlobe,
  faLock,
  faSignal,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../services/firebase";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

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

function AdminAnalytics() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [counts, setCounts] = useState({
    totalPageViews: 0,
    totalVisitors: 0,
    totalEvents: 0,
  });
  const [visitors, setVisitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);

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
    if (!user || !db) {
      return undefined;
    }

    const refreshCounts = async () => {
      try {
        const [visitorCount, pageViewCount, eventCount] = await Promise.all([
          getCountFromServer(collection(db, "visitors")),
          getCountFromServer(query(collection(db, "events"), where("type", "==", "page_view"))),
          getCountFromServer(collection(db, "events")),
        ]);

        setCounts({
          totalVisitors: visitorCount.data().count,
          totalPageViews: pageViewCount.data().count,
          totalEvents: eventCount.data().count,
        });
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    const visitorsQuery = query(
      collection(db, "visitors"),
      orderBy("lastSeenAt", "desc"),
      limit(80),
    );
    const sessionsQuery = query(
      collection(db, "sessions"),
      orderBy("lastSeenAt", "desc"),
      limit(80),
    );
    const eventsQuery = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(120));

    refreshCounts();

    const unsubscribeVisitors = onSnapshot(visitorsQuery, (snapshot) => {
      setVisitors(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubscribeVisitors();
      unsubscribeSessions();
      unsubscribeEvents();
    };
  }, [user]);

  const activeSessions = useMemo(() => {
    const cutoff = Date.now() - ONLINE_WINDOW_MS;
    return sessions.filter((session) => session.isActive !== false && toMillis(session.lastSeenAt) > cutoff);
  }, [sessions]);

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

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">Private dashboard</span>
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
                    <div>
                      <strong>{session.viewerLabel || session.visitorId || "Anonymous visitor"}</strong>
                      <span>
                        {session.device || "Unknown"} / {session.browser || "Unknown"}
                      </span>
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
                    <span>{event.section || event.channel || event.project || event.path || "Portfolio"}</span>
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
      </section>
    </main>
  );
}

export default AdminAnalytics;
