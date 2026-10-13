import React, { useState } from "react";
import { faCopy, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NglStoryModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    const text = `[HỎI ẨN DANH / NGL]\n❓ "${item.question}" - ${item.alias || "Ẩn danh"}\n\n💬 PHONG TRẢ LỜI:\n"${item.answer || "Đang soạn câu trả lời..."}"\n\n👉 Ghé portfolio hỏi ẩn danh cho Phong nhé!`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="ngl-modal-overlay" onClick={onClose}>
      <div className="ngl-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ngl-modal-header">
          <h3>📸 Xem trước Story Card (NGL 9:16)</h3>
          <button type="button" className="ngl-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="ngl-modal-tip">
          Bạn có thể chụp màn hình tấm thẻ 9:16 dưới đây để đăng trực tiếp lên Facebook / Instagram Story!
        </p>

        {/* 9:16 Story Canvas Container */}
        <div className="ngl-story-card">
          <div className="ngl-story-bg-mesh" />

          {/* Story Top Bar */}
          <div className="ngl-story-top">
            <div className="story-logo">
              <span className="story-logo-badge">NGL</span>
              <span className="story-logo-text">ngl.link/vudinhphong</span>
            </div>
            <span className="story-timestamp">Story Reply</span>
          </div>

          {/* Question Box */}
          <div className="ngl-story-question">
            <div className="story-question-pill">
              <span>Hỏi ẩn danh</span>
              {item.tag ? <span className="pill-tag">{item.tag}</span> : null}
            </div>
            <p className="story-question-text">"{item.question}"</p>
            <span className="story-sender">— {item.alias || "Người hỏi ẩn danh"}</span>
          </div>

          {/* Phong Answer Box */}
          <div className="ngl-story-answer">
            <div className="story-author-header">
              <div className="story-avatar">P</div>
              <div>
                <strong>Vũ Đình Phong ✓</strong>
                <small>Full-stack Dev & MOS Instructor</small>
              </div>
            </div>
            <p className="story-answer-text">
              {item.answer || "Chưa nhập câu trả lời. Bạn nhập và lưu câu trả lời trước nhé!"}
            </p>
          </div>

          {/* Story Footer Call to Action */}
          <div className="ngl-story-footer">
            <span>✨ Hỏi ẩn danh cho Phong tại trang portfolio</span>
          </div>
        </div>

        <div className="ngl-modal-actions">
          <button type="button" className="button-primary" onClick={handleCopy}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            <span>{copied ? "Đã copy nội dung!" : "Sao chép text câu trả lời"}</span>
          </button>
          <button type="button" className="button-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
