import React, { useEffect, useState, useRef } from "react";
import {
  faDice,
  faLock,
  faPaperPlane,
  faShieldHalved,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  submitAnonymousQuestion,
  subscribeAnsweredQuestions,
  subscribeNglPrompts,
} from "../services/questionService";
import { NGL_PROMPTS } from "../data/nglPrompts";
import { NGL_TOPICS } from "../data/nglTopics";
import NglWall from "./NglWall";
import NglCelebration from "./NglCelebration";

function AnonymousQuestions() {
  const [alias, setAlias] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [tag, setTag] = useState("NGL Anonymous");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepPrivate, setKeepPrivate] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [answeredList, setAnsweredList] = useState([]);
  const [promptsList, setPromptsList] = useState(NGL_PROMPTS);
  const questionInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeAnsweredQuestions(
      (items) => setAnsweredList(items || []),
      (err) => console.warn("Cannot fetch answered questions:", err)
    );
    const unsubPrompts = subscribeNglPrompts(
      (items) => {
        if (items && items.length > 0) {
          setPromptsList(items.map((p) => p.text));
        }
      },
      () => {}
    );
    return () => {
      unsubscribe?.();
      unsubPrompts?.();
    };
  }, []);

  const handleRollDice = () => {
    const activePrompts = promptsList.length > 0 ? promptsList : NGL_PROMPTS;
    const randomIndex = Math.floor(Math.random() * activePrompts.length);
    const chosen = activePrompts[randomIndex];
    setQuestion(chosen);
    setTag("🎲 Xúc xắc NGL");
    if (questionInputRef.current) {
      questionInputRef.current.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!question.trim()) {
      setErrorMessage("Bạn hãy nhập câu hỏi trước nhé.");
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
        website,
      });

      setQuestion("");
      setContact("");
      setKeepPrivate(false);
      setShowCelebration(true);
      window.setTimeout(() => setShowCelebration(false), 2200);
      setMessage(
        keepPrivate
          ? "🔒 Tin nhắn riêng tư đã được gửi an toàn tới Phong! Câu hỏi này sẽ không hiển thị công khai."
          : "✨ Tin nhắn ẩn danh đã được gửi tới Phong! Cảm ơn bạn rất nhiều.",
      );
    } catch (error) {
      setErrorMessage(error.message || "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ngl-container">
      <article className="ngl-card">
        <NglCelebration visible={showCelebration} />
        <div className="ngl-header">
          <div className="ngl-badge">
            <FontAwesomeIcon icon={faUserSecret} />
            <span>NGL • HỎI ĐÁP ẨN DANH</span>
          </div>
          <h3>Gửi câu hỏi hoặc tâm sự bí mật</h3>
          <p>
            Không cần đăng nhập hay tên thật. Phong sẽ nhận được và trả lời ở Bức tường bên dưới!
          </p>
        </div>

        <form className="ngl-form" onSubmit={handleSubmit}>
          <div className="ngl-topic-group" aria-label="Chọn chủ đề tin nhắn">
            <span className="ngl-topic-label">Bạn muốn nhắn về điều gì?</span>
            <div className="ngl-topic-pills">
              {NGL_TOPICS.map((topic) => {
                const value = `${topic.emoji} ${topic.label}`;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className={`ngl-topic-pill ${tag === value ? "active" : ""}`}
                    onClick={() => {
                      if (topic.id === "random") handleRollDice();
                      else setTag(value);
                    }}
                  >
                    <span>{topic.emoji}</span> {topic.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ngl-prompt-bar">
            <button
              type="button"
              className="ngl-dice-btn"
              onClick={handleRollDice}
              title="Nhấn để đổi câu hỏi gợi ý"
            >
              <FontAwesomeIcon icon={faDice} className="dice-icon" />
              <span>Gợi ý câu hỏi ngẫu nhiên 🎲</span>
            </button>
            <span className="ngl-char-count">{question.length}/600</span>
          </div>

          <label className="ngl-field">
            <textarea
              ref={questionInputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Nhập câu hỏi, thắc mắc về code, MOS, hoặc lời nhắn nhủ ẩn danh cho Phong..."
              maxLength={600}
              rows={4}
              required
            />
          </label>

          <div className="ngl-optional-row">
            <label className="ngl-field-sub">
              <span>Tên hiển thị (Tùy chọn)</span>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ví dụ: Một bạn sinh viên..."
                maxLength={40}
              />
            </label>

            <label className="ngl-field-sub">
              <span>Email / SĐT (Tùy chọn)</span>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="ban@example.com hoặc 09xxxxxxxx"
                maxLength={80}
              />
            </label>
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

          <label className="ngl-honeypot" aria-hidden="true">
            Website
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <div className="ngl-privacy-hint">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Không yêu cầu danh tính; dữ liệu kỹ thuật giới hạn được xử lý theo Chính sách quyền riêng tư.</span>
          </div>

          {message ? <div className="ngl-alert-success">{message}</div> : null}
          {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}

          <button type="submit" className="ngl-submit-btn" disabled={isSubmitting}>
            <FontAwesomeIcon icon={faPaperPlane} />
            <span>{isSubmitting ? "Đang gửi bí mật..." : "Gửi tin nhắn ẩn danh 🚀"}</span>
          </button>
        </form>
      </article>

      <NglWall answeredList={answeredList} />
    </div>
  );
}

export default AnonymousQuestions;
