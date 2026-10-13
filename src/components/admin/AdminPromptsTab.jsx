import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit, faLightbulb, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { addNglPrompt, deleteNglPrompt, updateNglPrompt } from "../../services/questionService";
import { NGL_PROMPTS as DEFAULT_PROMPTS } from "../../data/nglPrompts";

export default function AdminPromptsTab({ prompts = [], showToast }) {
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setIsSubmitting(true);
    try {
      await addNglPrompt(newText.trim());
      setNewText("");
      showToast("✅ Đã thêm câu hỏi gợi ý mới!");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateNglPrompt(id, editText.trim());
      setEditingId(null);
      showToast("✅ Đã cập nhật gợi ý!");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteNglPrompt(deleteCandidate.id);
      showToast("🗑️ Đã xóa câu hỏi gợi ý.");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setDeleteCandidate(null);
    }
  };

  const handleSeedDefaults = async () => {
    setIsSubmitting(true);
    try {
      for (const t of DEFAULT_PROMPTS.slice(0, 5)) {
        await addNglPrompt(t);
      }
      showToast("✅ Đã nạp 5 gợi ý mặc định!");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adm-prompts-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2>
            <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: 8, color: "#facc15" }} />
            Quản lý Gợi ý Câu hỏi NGL (Prompts CRUD)
          </h2>
          <p>Các câu hỏi gợi ý ngẫu nhiên khi bấm xúc xắc 🎲 trên trang NGL hoặc trang chủ.</p>
        </div>
        {prompts.length === 0 && (
          <button type="button" className="adm-btn-sec" onClick={handleSeedDefaults} disabled={isSubmitting}>
            🌱 Nạp gợi ý mẫu
          </button>
        )}
      </div>

      <form className="adm-prompts-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Nhập nội dung gợi ý mới..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" className="adm-btn-primary" disabled={isSubmitting || !newText.trim()}>
          <FontAwesomeIcon icon={faPlus} /> Thêm
        </button>
      </form>

      <div className="adm-prompts-list">
        {prompts.length === 0 ? (
          <div className="adm-question-card" style={{ textAlign: "center", color: "#94a3b8" }}>
            Chưa có gợi ý tùy chỉnh. Đang dùng danh sách tĩnh mặc định.
          </div>
        ) : (
          prompts.map((p, idx) => (
            <div className="adm-prompt-row" key={p.id}>
              <span style={{ color: "#64748b", fontWeight: 700, width: 28 }}>#{idx + 1}</span>
              {editingId === p.id ? (
                <input
                  type="text"
                  className="adm-search-input"
                  style={{ flex: 1 }}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className="adm-prompt-text">{p.text}</span>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {editingId === p.id ? (
                  <>
                    <button type="button" className="adm-btn-sec" style={{ color: "#34d399" }} onClick={() => handleSaveEdit(p.id)}>
                      <FontAwesomeIcon icon={faCheck} /> Lưu
                    </button>
                    <button type="button" className="adm-btn-sec" onClick={() => setEditingId(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="adm-btn-sec" onClick={() => { setEditingId(p.id); setEditText(p.text); }} title="Sửa">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button type="button" className="adm-btn-sec adm-btn-danger" onClick={() => setDeleteCandidate(p)} title="Xóa">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {deleteCandidate && (
        <div className="adm-modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa gợi ý?</h3>
            <p>"{deleteCandidate.text}"</p>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn-sec" onClick={() => setDeleteCandidate(null)}>Hủy</button>
              <button type="button" className="adm-btn-primary" style={{ background: "#ef4444" }} onClick={handleConfirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
