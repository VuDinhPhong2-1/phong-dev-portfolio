import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faStickyNote, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteAnonymousQuestion, saveSenderAdminNote } from "../../services/questionService";

export default function AdminSenderThreadModal({
  senderGroup,
  note = "",
  onClose,
  showToast,
}) {
  const [currentNote, setCurrentNote] = useState(note);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  if (!senderGroup) return null;

  const { senderKey, aliases, contacts, questions = [], ipAddress, deviceSummary, city, country } = senderGroup;

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await saveSenderAdminNote(senderKey, currentNote);
      showToast("💾 Đã lưu ghi chú!");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Xóa TẤT CẢ ${questions.length} tin từ người này?`)) return;
    setIsDeletingAll(true);
    try {
      for (const q of questions) {
        await deleteAnonymousQuestion(q.id);
      }
      showToast(`🗑️ Đã xóa ${questions.length} tin.`);
      onClose();
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal-box" style={{ maxWidth: 660, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <FontAwesomeIcon icon={faComments} style={{ color: "#ec4899" }} />
              Chuỗi Tin nhắn của Cùng 1 Người ({questions.length} tin)
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Định danh: <code>{senderKey}</code>
            </p>
          </div>
          <button type="button" className="adm-btn-sec" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <div><span style={{ color: "#94a3b8" }}>Bí danh: </span><strong>{Array.from(aliases).join(", ") || "Ẩn danh"}</strong></div>
            {contacts.size > 0 && <div><span style={{ color: "#94a3b8" }}>Liên hệ: </span><strong style={{ color: "#38bdf8" }}>{Array.from(contacts).join(", ")}</strong></div>}
            {ipAddress && <div><span style={{ color: "#94a3b8" }}>IP: </span>{ipAddress}</div>}
            {(city || country) && <div><span style={{ color: "#94a3b8" }}>Vị trí: </span>{[city, country].filter(Boolean).join(", ")}</div>}
          </div>
          {deviceSummary && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Thiết bị: {deviceSummary}</div>}
        </div>

        <div className="adm-sender-note-bar" style={{ marginBottom: 14 }}>
          <FontAwesomeIcon icon={faStickyNote} style={{ color: "#facc15" }} />
          <input
            type="text"
            placeholder="Ghi chú nội bộ cho người này (VD: Bạn học, Khách tiềm năng)..."
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
          />
          <button type="button" className="adm-btn-sec" onClick={handleSaveNote} disabled={isSavingNote}>
            {isSavingNote ? "..." : "Lưu Note"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {questions.map((msg, idx) => (
            <div key={msg.id} className="adm-thread-msg-item">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: "#ec4899" }}>
                  Tin #{idx + 1} • {msg.alias} {msg.tag ? `(${msg.tag})` : ""}
                </span>
                <span style={{ color: "#94a3b8" }}>{msg.keepPrivate ? "🔒 Riêng tư" : msg.isPublic ? "🌐 Công khai" : "Chờ duyệt"}</span>
              </div>
              <p style={{ margin: "0 0 6px", color: "#f1f5f9", fontSize: 14 }}>{msg.question}</p>
              {msg.answer && (
                <div style={{ background: "rgba(16,185,129,0.1)", borderLeft: "3px solid #10b981", padding: "6px 10px", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#6ee7b7" }}>
                  <strong>Admin: </strong>{msg.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="adm-modal-actions" style={{ justifyContent: "space-between" }}>
          <button type="button" className="adm-btn-sec adm-btn-danger" onClick={handleDeleteAll} disabled={isDeletingAll}>
            <FontAwesomeIcon icon={faTrash} /> Xóa tất cả {questions.length} tin này
          </button>
          <button type="button" className="adm-btn-sec" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
