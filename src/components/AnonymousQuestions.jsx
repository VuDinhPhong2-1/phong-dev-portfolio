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
import NglWall from "./NglWall";

const RATE_LIMIT_KEY = "ngl_submit_rate_limit";

function AnonymousQuestions() {
  const [alias, setAlias] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [tag, setTag] = useState("NGL Anonymous");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepPrivate, setKeepPrivate] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  const checkRateLimit = () => {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      const data = raw ? JSON.parse(raw) : { count: 0, time: Date.now() };
      const now = Date.now();

      if (now - data.time > 3 * 60 * 1000) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, time: now }));
        return true;
      }
      if (data.count >= 4) return false;

      localStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify({ count: data.count + 1, time: data.time })
      );
      return true;
    } catch {
      return true;
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

    if (!checkRateLimit()) {
      setErrorMessage("Bạn đang gửi hơi nhanh, hãy đợi 1-2 phút rồi gửi tiếp nhé!");
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
        <div className="ngl-header">
          <div className="ngl-badge">
            <FontAwesomeIcon icon={faUserSecret} />
            <span>NGL • HỎI ĐÁP ẨN DANH</span>
          </div>
          <h3>Gửi câu hỏi hoặc tâm sự bí mật</h3>
          <p>
            100% ẩn danh, không cần đăng nhập. Phong sẽ nhận được và trả lời ở Bức tường bên dưới!
          </p>
        </div>

        <form className="ngl-form" onSubmit={handleSubmit}>
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

          <div className="ngl-privacy-hint">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Danh tính của bạn được giữ kín hoàn toàn.</span>
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
