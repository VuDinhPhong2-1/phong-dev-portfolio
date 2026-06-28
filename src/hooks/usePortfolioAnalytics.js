import { useEffect, useRef } from "react";
import {
  heartbeatPortfolioSession,
  startPortfolioTracking,
  stopPortfolioSession,
  trackPortfolioEvent,
} from "../services/analyticsTracker";

const HEARTBEAT_MS = 30 * 1000;

export const usePortfolioAnalytics = () => {
  const viewedSectionsRef = useRef(new Set());

  useEffect(() => {
    let heartbeatTimer;
    let observer;
    let isMounted = true;

    const start = async () => {
      const result = await startPortfolioTracking();

      if (!isMounted || !result.enabled) {
        return;
      }

      heartbeatTimer = window.setInterval(heartbeatPortfolioSession, HEARTBEAT_MS);

      const sections = Array.from(document.querySelectorAll("section[data-name]"));
      if ("IntersectionObserver" in window && sections.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              const sectionName = entry.target.dataset.name;
              if (!sectionName || viewedSectionsRef.current.has(sectionName)) {
                return;
              }

              viewedSectionsRef.current.add(sectionName);
              trackPortfolioEvent("section_view", { section: sectionName });
            });
          },
          { threshold: 0.5 },
        );

        sections.forEach((section) => observer.observe(section));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPortfolioSession();
      } else {
        heartbeatPortfolioSession();
      }
    };

    start();
    window.addEventListener("pagehide", stopPortfolioSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
      }
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("pagehide", stopPortfolioSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
};
