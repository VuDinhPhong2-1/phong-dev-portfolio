import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBell,
  faCheck,
  faCopy,
  faDice,
  faInbox,
  faLock,
  faPaperPlane,
  faShieldHalved,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import {
  submitAnonymousQuestion,
  subscribeAnsweredQuestions,
  subscribeNglPrompts,
} from "../services/questionService";
import {
  getUserQuestions,
  markQuestionAsRead,
  requestNotificationPermission,
  subscribeToMyQuestions,
} from "../services/nglNotificationService";
import { NGL_PROMPTS } from "../data/nglPrompts";
import NglWall from "./NglWall";
import MagicCanvas from "./MagicCanvas";

export default function NglStandalonePage() {
  const [activeTab, setActiveTab] = useState("ask");
  const [alias, setAlias] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [tag, setTag] = useState("NGL Anonymous");
  const [keepPrivate, setKeepPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const [myQuestions, setMyQuestions] = useState(getUserQuestions());
  const [answeredPublicList, setAnsweredPublicList] = useState([]);
  const [promptsList, setPromptsList] = useState(NGL_PROMPTS);
  const questionInputRef = useRef(null);

  useEffect(() => {
    const unsubPublic = subscribeAnsweredQuestions(
      (items) => setAnsweredPublicList(items || []),
      (err) => console.warn(err)
    );
    const unsubMine = subscribeToMyQuestions((items) => {
      setMyQuestions(items || []);
    });
    const unsubPrompts = subscribeNglPrompts(
      (items) => {
        if (items && items.length > 0) {
          setPromptsList(items.map((p) => p.text));
        }
      },
      () => {}
    );

    return () => {
      unsubPublic?.();
      unsubMine?.();
      unsubPrompts?.();
    };
  }, []);

  const unreadCount = myQuestions.filter((q) => q.status === "answered" && !q.read).length;

  const handleRollDice = () => {
    const activePrompts = promptsList.length > 0 ? promptsList : NGL_PROMPTS;
    const idx = Math.floor(Math.random() * activePrompts.length);
    setQuestion(activePrompts[idx]);
    setTag("🎲 Xúc xắc NGL");
    questionInputRef.current?.focus();
  };

  const handleCopyPageLink = () => {
    const url = window.location.origin + window.location.pathname + "#/ngl";
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!question.trim()) {
      setErrorMessage("Vui lòng nhập nội dung câu hỏi trước nhé.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAnonymousQuestion({
        alias: alias.trim() || "Người hỏi ẩn danh",
        contact: contact.trim(),
        question: question.trim(),
        tag,
        keepPrivate,
      });

      setQuestion("");
      setContact("");
      setKeepPrivate(false);
      setMyQuestions(getUserQuestions());
      setMessage(
        keepPrivate
          ? "🔒 Tin nhắn riêng tư đã được gửi tới Phong! Câu hỏi này được bảo mật và không xuất hiện trên Bức tường Q&A."
          : "✨ Câu hỏi đã được gửi tới Phong! Hãy chuyển qua tab 'Hộp thư của tôi' để theo dõi trả lời nhé."
      );
      if (notifPermission === "default") {
        handleEnableNotification();
      }
    } catch (err) {
      setErrorMessage(err.message || "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ngl-standalone-root">
      <MagicCanvas />
      <div className="ngl-standalone-container">
        {/* Top bar */}
        <header className="ngl-standalone-nav">
          <a href="#/" className="ngl-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Về Portfolio</span>
          </a>

          <div className="ngl-nav-actions">
            <button
              type="button"
              className="ngl-action-pill"
              onClick={handleCopyPageLink}
              title="Sao chép link trang này"
            >
              <FontAwesomeIcon icon={copiedLink ? faCheck : faCopy} />
              <span>{copiedLink ? "Đã sao chép link" : "Chia sẻ link"}</span>
            </button>

            {notifPermission !== "granted" && (
              <button
                type="button"
                className="ngl-action-pill notif-pill"
                onClick={handleEnableNotification}
                title="Bật thông báo khi có trả lời"
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Bật chuông thông báo</span>
              </button>
            )}
          </div>
        </header>

        {/* Profile Card Header */}
        <section className="ngl-profile-hero">
          <div className="ngl-avatar-wrap">
            <img
              src="/assets/images/phong-avatar.png"
              alt="Vu Dinh Phong"
              className="ngl-avatar-img"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
              }}
            />
            <span className="ngl-verified-badge" title="Đã xác minh">✓</span>
          </div>

          <h1 className="ngl-profile-name">
            Vũ Đình Phong <span className="ngl-handle">@phongdev</span>
          </h1>
          <p className="ngl-profile-bio">
            Hỏi bất cứ điều gì ẩn danh 100% 💬 | Nhận câu trả lời trực tiếp từ Phong
          </p>

          <div className="ngl-pills-row">
            <span className="ngl-pill-item">🔒 Hoàn toàn ẩn danh</span>
            <span className="ngl-pill-item">⚡ Nhận tin ngay khi có phản hồi</span>
          </div>
        </section>

        {/* Tab Buttons */}
        <nav className="ngl-tabs-bar">
          <button
            type="button"
            className={`ngl-tab-btn ${activeTab === "ask" ? "active" : ""}`}
            onClick={() => setActiveTab("ask")}
          >
            <span>💌 Gửi câu hỏi</span>
          </button>

          <button
            type="button"
            className={`ngl-tab-btn ${activeTab === "inbox" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("inbox");
              myQuestions.forEach((q) => {
                if (q.status === "answered" && !q.read) {
                  markQuestionAsRead(q.id);
                }
              });
              setMyQuestions(getUserQuestions());
            }}
          >
            <span>📬 Hộp thư của tôi</span>
            {unreadCount > 0 && <span className="ngl-unread-badge">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className={`ngl-tab-btn ${activeTab === "wall" ? "active" : ""}`}
            onClick={() => setActiveTab("wall")}
          >
            <span>🌟 Bức tường Q&A ({answeredPublicList.length})</span>
          </button>
        </nav>

        {/* Tab 1: Ask Form */}
        {activeTab === "ask" && (
          <div className="ngl-card ngl-standalone-card">
            <div className="ngl-prompt-bar">
              <button type="button" className="ngl-dice-btn" onClick={handleRollDice}>
                <FontAwesomeIcon icon={faDice} />
                <span>Gợi ý ngẫu nhiên</span>
              </button>
              <span className="ngl-char-count">{question.length}/600</span>
            </div>

            <form onSubmit={handleSubmit} className="ngl-form">
              <div className="ngl-field">
                <textarea
                  ref={questionInputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Gửi tin nhắn ẩn danh cho tôi... Hãy thoải mái hỏi hoặc tâm sự bất cứ điều gì!"
                  rows={4}
                  maxLength={600}
                  required
                />
              </div>

              <div className="ngl-optional-row">
                <div className="ngl-field-sub">
                  <span>Biệt danh của bạn (tuỳ chọn):</span>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="VD: Người giấu tên, Bạn học..."
                    maxLength={40}
                  />
                </div>

                <div className="ngl-field-sub">
                  <span>Liên hệ nhận câu trả lời riêng (tuỳ chọn):</span>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email hoặc SĐT để Phong trả lời riêng"
                    maxLength={80}
                  />
                </div>
              </div>

              <label className={`ngl-privacy-option ${keepPrivate ? "active" : ""}`}>
                <input
                  type="checkbox"
                  checked={keepPrivate}
                  onChange={(e) => setKeepPrivate(e.target.checked)}
                />
                <div className="ngl-privacy-option-content">
                  <div className="ngl-privacy-option-header">
                    <FontAwesomeIcon icon={faLock} className="ngl-lock-icon" />
                    <strong>Không công khai câu hỏi này</strong>
                  </div>
                  <p>Chỉ gửi riêng tư cho Phong, không hiển thị lên Bức tường Q&A công khai.</p>
                </div>
              </label>

              {errorMessage && <div className="ngl-alert-error">{errorMessage}</div>}
              {message && <div className="ngl-alert-success">{message}</div>}

              <button
                type="submit"
                className="ngl-submit-btn"
                disabled={isSubmitting || !question.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>{isSubmitting ? "Đang gửi..." : "Gửi tin nhắn ẩn danh"}</span>
              </button>

              <div className="ngl-privacy-hint">
                <FontAwesomeIcon icon={faShieldHalved} />
                <span>Bảo mật 100%: Danh tính của bạn luôn được ẩn danh hoàn toàn.</span>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: User's Own Inbox & Answers */}
        {activeTab === "inbox" && (
          <div className="ngl-inbox-section">
            <div className="ngl-inbox-header">
              <h3>Hộp thư của bạn ({myQuestions.length})</h3>
              <p>Danh sách các câu hỏi bạn đã gửi từ trình duyệt này và phản hồi từ Phong.</p>
            </div>

            {myQuestions.length === 0 ? (
              <div className="ngl-empty-box">
                <FontAwesomeIcon icon={faInbox} className="empty-icon" />
                <p>Bạn chưa gửi câu hỏi nào từ thiết bị này.</p>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setActiveTab("ask")}
                >
                  Gửi câu hỏi đầu tiên ngay
                </button>
              </div>
            ) : (
              <div className="ngl-my-questions-list">
                {myQuestions.map((item) => (
                  <article key={item.id} className="ngl-my-item">
                    <div className="ngl-my-q-bubble">
                      <div className="ngl-my-meta">
                        <span className="ngl-my-alias">
                          <FontAwesomeIcon icon={faUserSecret} /> {item.alias}
                        </span>
                        {item.keepPrivate && (
                          <span className="ngl-my-private-tag">
                            <FontAwesomeIcon icon={faLock} /> Riêng tư
                          </span>
                        )}
                        <span className={`ngl-status-badge ${item.status}`}>
                          {item.status === "answered"
                            ? "✅ Đã được Phong giải đáp"
                            : "⏳ Đang chờ Phong trả lời"}
                        </span>
                      </div>
                      <p className="ngl-my-question-text">{item.question}</p>
                    </div>

                    {item.status === "answered" && item.answer ? (
                      <div className="ngl-my-a-bubble">
                        <div className="ngl-author-bar">
                          <span className="ngl-author-badge">Vũ Đình Phong ✓</span>
                          <span className="ngl-reply-tag">Đã phản hồi</span>
                        </div>
                        <p className="ngl-answer-text">{item.answer}</p>
                      </div>
                    ) : (
                      <div className="ngl-waiting-banner">
                        <span>Phong sẽ giải đáp sớm! Bạn hãy bật chuông để nhận thông báo tức thì nhé.</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Public Wall */}
        {activeTab === "wall" && (
          <div className="ngl-wall-tab-wrap">
            <NglWall answeredList={answeredPublicList} />
          </div>
        )}
      </div>
    </div>
  );
}
