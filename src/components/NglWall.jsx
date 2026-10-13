import React, { useState } from "react";
import {
  faHeart,
  faQuestionCircle,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LIKES_KEY = "ngl_liked_questions";

export default function NglWall({ answeredList = [] }) {
  const [likes, setLikes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LIKES_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const handleToggleLike = (id) => {
    setLikes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(LIKES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <section className="ngl-wall">
      <div className="ngl-wall-heading">
        <div className="eyebrow">✦ PUBLIC Q&A FEED ✦</div>
        <h3>Bức tường giải đáp công khai</h3>
        <p>Những câu hỏi ẩn danh thú vị đã được Phong giải đáp.</p>
      </div>

      {answeredList.length === 0 ? (
        <div className="ngl-wall-empty">
          <FontAwesomeIcon icon={faQuestionCircle} className="empty-icon" />
          <p>Chưa có câu hỏi công khai nào được giải đáp.</p>
          <span>Hãy là người đầu tiên đặt câu hỏi cho Phong ở form bên trên nhé!</span>
        </div>
      ) : (
        <div className="ngl-qa-grid">
          {answeredList.map((item) => {
            const isLiked = Boolean(likes[item.id]);
            return (
              <article key={item.id} className="ngl-qa-card">
                {/* Question Sticker */}
                <div className="ngl-question-bubble">
                  <div className="bubble-meta">
                    <span className="bubble-alias">
                      <FontAwesomeIcon icon={faUserSecret} /> {item.alias || "Người hỏi ẩn danh"}
                    </span>
                    {item.tag ? <span className="bubble-tag">{item.tag}</span> : null}
                  </div>
                  <p className="bubble-content">{item.question}</p>
                </div>

                {/* Phong's Answer Sticker */}
                <div className="ngl-answer-bubble">
                  <div className="bubble-author">
                    <div className="author-avatar">P</div>
                    <div className="author-info">
                      <strong>Vũ Đình Phong <span className="verified-badge">✓</span></strong>
                      <small>Tác giả Portfolio</small>
                    </div>
                  </div>
                  <p className="answer-content">{item.answer}</p>

                  <div className="bubble-actions">
                    <button
                      type="button"
                      className={`like-btn ${isLiked ? "liked" : ""}`}
                      onClick={() => handleToggleLike(item.id)}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      <span>{isLiked ? "Đã thích" : "Thả tim"}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
