import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { trackPortfolioEvent } from "../services/analyticsTracker";

export default function FloatingNglBubble() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse the label after 6.5s to keep screen spacious, but keep icon clickable
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  if (isDismissed) return null;

  const handleClick = () => {
    trackPortfolioEvent("floating_bubble_click", {
      platform: "messenger",
      isExpanded,
    });
    window.location.hash = "#/ngl";
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    trackPortfolioEvent("floating_bubble_dismiss");
    setIsDismissed(true);
  };

  return (
    <aside
      className={`ngl-floating-bubble ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      aria-label="Nhắn tin ẩn danh"
    >
      <div className="ngl-bubble-glow-ring" />
      <button
        type="button"
        className="ngl-bubble-main-btn"
        onClick={handleClick}
        title="Gửi câu hỏi ẩn danh NGL"
      >
        <span className="ngl-bubble-icon-wrap">
          <FontAwesomeIcon icon={faFacebookMessenger} className="ngl-bubble-icon" />
          <span className="ngl-bubble-badge-dot" />
        </span>
        {isExpanded && (
          <span className="ngl-bubble-text-wrap">
            <strong className="ngl-bubble-title">Nhắn tin ẩn danh</strong>
            <small className="ngl-bubble-sub">Hỏi gì cũng được 🤫</small>
          </span>
        )}
      </button>

      {isExpanded ? (
        <button
          type="button"
          className="ngl-bubble-close-btn"
          onClick={handleDismiss}
          title="Đóng bong bóng"
          aria-label="Đóng bong bóng"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      ) : null}
    </aside>
  );
}



