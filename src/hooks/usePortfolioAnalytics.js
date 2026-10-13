import { useEffect, useRef } from "react";
import {
  heartbeatPortfolioSession,
  startPortfolioTracking,
  stopPortfolioSession,
  trackPortfolioEvent,
} from "../services/analyticsTracker";

const HEARTBEAT_MS = 10 * 1000;

export const usePortfolioAnalytics = () => {
  const viewedSectionsRef = useRef(new Set());
  const scrollMilestonesRef = useRef(new Set());
  const currentSectionRef = useRef({ name: null, startTime: null });

  useEffect(() => {
    let heartbeatTimer;
    let observer;
    let scrollTimer = null;
    let isMounted = true;

    // Helper: Ghi nhận thời gian đọc một section
    const flushSectionDwell = () => {
      const { name, startTime } = currentSectionRef.current;
      if (name && startTime) {
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        if (durationSeconds >= 2) {
          trackPortfolioEvent("section_dwell", {
            section: name,
            durationSeconds,
          });
        }
      }
      currentSectionRef.current = { name: null, startTime: null };
    };

    const start = async () => {
      const result = await startPortfolioTracking();

      if (!isMounted || !result.enabled) {
        return;
      }

      heartbeatTimer = window.setInterval(heartbeatPortfolioSession, HEARTBEAT_MS);

      // 1. Intersection Observer theo dõi section và thời gian đọc (dwell time)
      const sections = Array.from(document.querySelectorAll("section[data-name]"));
      if ("IntersectionObserver" in window && sections.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const sectionName = entry.target.dataset.name;
              if (!sectionName) return;

              if (entry.isIntersecting) {
                // Section view lần đầu
                if (!viewedSectionsRef.current.has(sectionName)) {
                  viewedSectionsRef.current.add(sectionName);
                  trackPortfolioEvent("section_view", { section: sectionName });
                }

                // Chuyển sang section mới -> flush section cũ và bắt đầu tính dwell time cho section mới
                if (currentSectionRef.current.name !== sectionName) {
                  flushSectionDwell();
                  currentSectionRef.current = {
                    name: sectionName,
                    startTime: Date.now(),
                  };
                }
              }
            });
          },
          { threshold: 0.45 },
        );

        sections.forEach((section) => observer.observe(section));
      }

      // 2. Scroll Depth tracking (25%, 50%, 75%, 100%)
      const handleScroll = () => {
        if (scrollTimer) return;
        scrollTimer = window.setTimeout(() => {
          scrollTimer = null;
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollHeight <= 0) return;

          const scrollPercentage = Math.min(
            100,
            Math.round((window.scrollY / scrollHeight) * 100)
          );

          [25, 50, 75, 100].forEach((milestone) => {
            if (scrollPercentage >= milestone && !scrollMilestonesRef.current.has(milestone)) {
              scrollMilestonesRef.current.add(milestone);
              trackPortfolioEvent("scroll_depth", { depth: milestone });
            }
          });
        }, 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      // 3. Text Copy tracking (sao chép SĐT, email, thông tin liên hệ...)
      const handleCopy = () => {
        const selectionObject = window.getSelection();
        const selection = selectionObject?.toString()?.trim();
        if (selection && selection.length >= 3) {
          const anchorElement = selectionObject?.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? selectionObject.anchorNode
            : selectionObject?.anchorNode?.parentElement;
          const context = anchorElement?.closest?.('section[data-name="contact"]')
            ? "contact"
            : "page";
          trackPortfolioEvent("text_copy", {
            textSnippet: selection.slice(0, 80),
            length: selection.length,
            context,
          });
        }
      };

      document.addEventListener("copy", handleCopy);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("copy", handleCopy);
      };
    };

    let cleanupScrollAndCopy;
    start().then((cleaner) => {
      cleanupScrollAndCopy = cleaner;
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushSectionDwell();
        heartbeatPortfolioSession();
      } else {
        heartbeatPortfolioSession();
      }
    };

    const handlePageHide = () => {
      flushSectionDwell();
      stopPortfolioSession();
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      flushSectionDwell();
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
      }
      if (observer) {
        observer.disconnect();
      }
      if (cleanupScrollAndCopy) {
        cleanupScrollAndCopy();
      }
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
};

