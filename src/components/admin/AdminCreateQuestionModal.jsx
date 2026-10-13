import React, { useState } from "react";
import { createQuestionByAdmin } from "../../services/questionService";

export default function AdminCreateQuestionModal({ onClose, showToast }) {
  const [alias, setAlias] = useState("Vũ Đình Phong (Admin)");
  const [tag, setTag] = useState("Thông báo Q&A");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsSubmitting(true);
    try {
      await createQuestionByAdmin({
        alias: alias.trim(),
        tag: tag.trim(),
        question: question.trim(),
        answer: answer.trim(),
        isPublic,
      });
      showToast("🎉 Đã tạo câu hỏi/thông báo thành công!");
      onClose();
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>➕ Đăng Câu hỏi / Thông báo Mới</h3>
        <p>Nội dung này có thể xuất hiện trực tiếp trên Bảng tin Q&A của Portfolio.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Người đăng / Tên hiển thị</label>
            <input
              type="text"
              className="adm-search-input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Chủ đề (Tag)</label>
            <input
              type="text"
              className="adm-search-input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Câu hỏi hoặc Tiêu đề</label>
            <textarea
              className="adm-answer-textarea"
              style={{ minHeight: 60 }}
              placeholder="Nhập nội dung câu hỏi/thông báo..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Câu trả lời của Admin (Tùy chọn)</label>
            <textarea
              className="adm-answer-textarea"
              style={{ minHeight: 80 }}
              placeholder="Nhập câu trả lời sẵn nếu muốn đăng ngay..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <label className="adm-public-switch-wrap">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Công khai lên Bảng tin Q&A ngay lập tức
          </label>

          <div className="adm-modal-actions" style={{ marginTop: 10 }}>
            <button type="button" className="adm-btn-sec" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="adm-btn-primary" disabled={isSubmitting || !question.trim()}>
              {isSubmitting ? "Đang tạo..." : "Đăng lên Q&A"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
