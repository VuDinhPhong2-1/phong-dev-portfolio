import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faFire,
  faStickyNote,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminQuestionCard({
  item,
  group,
  senderKey,
  note = "",
  onSaveAnswer,
  onTogglePublic,
  onDelete,
  onOpenThread,
  onOpenStory,
}) {
  const [answerDraft, setAnswerDraft] = useState(item.answer || "");
  const multiCount = group ? group.questions.length : 1;
  const isMulti = multiCount > 1;
  const aliasArray = group ? Array.from(group.aliases) : [];
  const hasAliasMismatch = aliasArray.length > 1;

  return (
    <div
      className={`adm-question-card ${isMulti ? "has-multi-sender" : ""} ${item.keepPrivate ? "is-private-card" : ""}`}
    >
      <div className="adm-q-header">
        <div className="adm-q-author-row">
          <strong className="adm-q-alias">{item.alias || "Người hỏi ẩn danh"}</strong>
          {item.tag && <span className="adm-q-tag">{item.tag}</span>}
          {item.keepPrivate && <span className="adm-q-badge-private">🔒 Riêng tư</span>}
          {item.status === "answered" && <span className="adm-tab-pill is-success">Đã trả lời</span>}

          {isMulti && (
            <button
              type="button"
              className="adm-multi-sender-badge"
              onClick={() => onOpenThread(group)}
              title="Bấm để xem chuỗi tin nhắn của người này"
            >
              <FontAwesomeIcon icon={faFire} /> CÙNG 1 NGƯỜI (ĐÃ GỬI {multiCount} TIN)
            </button>
          )}
        </div>

        <div className="adm-q-meta-info">
          <span className="adm-q-sender-id">#{senderKey.slice(-8)}</span>
          {item.ipAddress && <span>IP: {item.ipAddress}</span>}
          {item.city && <span>{item.city}</span>}
        </div>
      </div>

      {hasAliasMismatch && (
        <div className="adm-alias-history-alert">
          ⚠️ <strong>Cảnh báo đổi tên:</strong> Người này từng dùng các tên khác: [ {aliasArray.join(", ")} ]
        </div>
      )}

      {note && (
        <div style={{ fontSize: 12, color: "#fef08a", background: "rgba(234,179,8,0.15)", padding: "4px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FontAwesomeIcon icon={faStickyNote} /> Ghi chú nội bộ: {note}
        </div>
      )}

      <div className="adm-q-body">{item.question}</div>

      {item.answer && (
        <div className="adm-current-answer-preview">
          <strong>Đã trả lời: </strong> {item.answer}
        </div>
      )}

      <div className="adm-answer-box">
        <textarea
          className="adm-answer-textarea"
          placeholder="Nhập hoặc sửa câu trả lời của Admin..."
          value={answerDraft}
          onChange={(e) => setAnswerDraft(e.target.value)}
        />
      </div>

      <div className="adm-card-actions">
        <label className={`adm-public-switch-wrap ${item.keepPrivate ? "is-private-req" : ""}`}>
          <input
            type="checkbox"
            checked={Boolean(item.isPublic)}
            onChange={(e) => onTogglePublic(item, e.target.checked)}
          />
          <span>Công khai lên Wall {item.keepPrivate ? "(⚠️ Khách xin giữ kín)" : ""}</span>
        </label>

        <div className="adm-action-buttons-group">
          {isMulti && (
            <button
              type="button"
              className="adm-btn-sec"
              onClick={() => onOpenThread(group)}
            >
              <FontAwesomeIcon icon={faComments} /> Xem chuỗi ({multiCount})
            </button>
          )}

          <button
            type="button"
            className="adm-btn-sec"
            onClick={() => onOpenStory({ ...item, answer: answerDraft })}
          >
            📸 Story Card
          </button>

          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => onSaveAnswer(item, answerDraft)}
          >
            💾 Lưu trả lời
          </button>

          <button
            type="button"
            className="adm-btn-sec adm-btn-danger"
            onClick={() => onDelete(item)}
            title="Xóa tin này"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}
