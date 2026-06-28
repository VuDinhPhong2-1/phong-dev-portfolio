import React, { useEffect, useMemo, useState } from "react";
import { faMasksTheater } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { attachVisitorProfile, trackPortfolioEvent } from "../services/analyticsTracker";
import { isFirebaseConfigured } from "../services/firebase";

const isSocialReferrer = () => {
  if (typeof document === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const explicitSource = `${params.get("utm_source") || ""} ${params.get("ref") || ""}`.toLowerCase();

  if (explicitSource.includes("facebook") || explicitSource.includes("anonymous")) {
    return true;
  }

  if (!document.referrer) {
    return false;
  }

  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    return hostname === "facebook.com" || hostname.endsWith(".facebook.com");
  } catch {
    return document.referrer.toLowerCase().includes("facebook.com");
  }
};

const normalizeAlias = (value) => value.trim().replace(/\s+/g, " ").slice(0, 40);

function AnonymousVisitorPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [alias, setAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const shouldAsk = useMemo(
    () =>
      isFirebaseConfigured &&
      !window.location.hash.startsWith("#/admin-analytics") &&
      isSocialReferrer(),
    [],
  );

  useEffect(() => {
    if (!shouldAsk) {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [shouldAsk]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextAlias = normalizeAlias(alias);
    if (!nextAlias) {
      setErrorMessage("Bạn nhập một tên ẩn danh ngắn nhé.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await attachVisitorProfile({
        provider: "anonymous_alias",
        displayName: nextAlias,
      });
      setIsVisible(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    trackPortfolioEvent("anonymous_alias_skipped");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="anonymous-prompt" role="dialog" aria-modal="true" aria-labelledby="anonymous-prompt-title">
      <form className="anonymous-prompt-panel" onSubmit={handleSubmit}>
        <button
          type="button"
          className="anonymous-prompt-close"
          aria-label="Close"
          onClick={handleSkip}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="anonymous-prompt-icon">
          <FontAwesomeIcon icon={faMasksTheater} />
        </div>
        <h2 id="anonymous-prompt-title">Bạn muốn xuất hiện với tên nào?</h2>
        <p>
          Bạn có thể đặt một tên ẩn danh để chủ portfolio nhận ra lượt ghé thăm này. Portfolio vẫn
          lưu thông tin thiết bị cơ bản như trình duyệt, hệ điều hành, kích thước màn hình và nguồn truy cập.
        </p>

        <label className="anonymous-alias-field">
          Tên ẩn danh
          <input
            type="text"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            placeholder="Ví dụ: Người hỏi ẩn danh"
            maxLength={40}
            autoFocus
          />
        </label>

        {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}

        <div className="anonymous-prompt-actions">
          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu tên ẩn danh"}
          </button>
          <button type="button" className="button-secondary" onClick={handleSkip}>
            Bỏ qua
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnonymousVisitorPrompt;
