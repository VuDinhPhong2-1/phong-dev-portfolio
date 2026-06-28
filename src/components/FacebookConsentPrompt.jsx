import React, { useEffect, useMemo, useState } from "react";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { attachVisitorProfile, trackPortfolioEvent } from "../services/analyticsTracker";
import { auth, isAdminEmail, isFirebaseConfigured } from "../services/firebase";

const FACEBOOK_PROFILE_STATUS_KEY = "portfolio_facebook_profile_status";

const isFacebookReferrer = () => {
  if (typeof document === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const explicitSource = `${params.get("utm_source") || ""} ${params.get("ref") || ""}`.toLowerCase();

  if (explicitSource.includes("facebook")) {
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

function FacebookConsentPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const shouldAsk = useMemo(
    () =>
      isFirebaseConfigured &&
      auth &&
      !window.location.hash.startsWith("#/admin-analytics") &&
      isFacebookReferrer(),
    [],
  );

  useEffect(() => {
    if (!shouldAsk) {
      return;
    }

    const currentUser = auth.currentUser;
    const status = localStorage.getItem(FACEBOOK_PROFILE_STATUS_KEY);

    if (status === "allowed" || status === "skipped" || isAdminEmail(currentUser?.email)) {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [shouldAsk]);

  const closePrompt = (status) => {
    localStorage.setItem(FACEBOOK_PROFILE_STATUS_KEY, status);
    setIsVisible(false);
  };

  const handleAllow = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope("public_profile");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await attachVisitorProfile({
        authUid: user.uid,
        provider: "facebook.com",
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      localStorage.setItem(FACEBOOK_PROFILE_STATUS_KEY, "allowed");
      setIsVisible(false);
    } catch (error) {
      setErrorMessage(error.message);
      trackPortfolioEvent("facebook_profile_denied", {
        reason: error.code || "unknown",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    closePrompt("skipped");
    trackPortfolioEvent("facebook_profile_skipped");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="facebook-consent" role="dialog" aria-modal="true" aria-labelledby="facebook-consent-title">
      <div className="facebook-consent-panel">
        <button
          type="button"
          className="facebook-consent-close"
          aria-label="Close"
          onClick={handleSkip}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="facebook-consent-icon">
          <FontAwesomeIcon icon={faFacebook} />
        </div>
        <h2 id="facebook-consent-title">Cho phép nhận thông tin Facebook?</h2>
        <p>
          Portfolio chỉ lưu tên và ảnh đại diện của bạn để chủ portfolio biết ai đã ghé thăm từ
          Facebook.
        </p>

        {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}

        <div className="facebook-consent-actions">
          <button type="button" className="button-primary" onClick={handleAllow} disabled={isSubmitting}>
            {isSubmitting ? "Đang kết nối..." : "Cho phép"}
          </button>
          <button type="button" className="button-secondary" onClick={handleSkip}>
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

export default FacebookConsentPrompt;
