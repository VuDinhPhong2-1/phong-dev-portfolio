import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faFire,
  faList,
  faPlus,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import {
  answerAnonymousQuestion,
  deleteAnonymousQuestion,
  toggleQuestionPublic,
} from "../../services/questionService";
import AdminQuestionCard from "./AdminQuestionCard";
import AdminCreateQuestionModal from "./AdminCreateQuestionModal";
import AdminSenderThreadModal from "./AdminSenderThreadModal";

export const getSenderKey = (q) => {
  if (q.visitorId && q.visitorId !== "unknown_visitor" && q.visitorId !== "admin_author") {
    return `v_${q.visitorId}`;
  }
  if (q.deviceFingerprint && q.deviceFingerprint !== "fp_unknown" && q.ipAddress) {
    return `fp_ip_${q.ipAddress}_${q.deviceFingerprint}`;
  }
  if (q.ipAddress) {
    return `ip_${q.ipAddress}`;
  }
  return `q_${q.id}`;
};

export default function AdminQuestionsTab({
  questions = [],
  senderNotes = {},
  showToast,
  onOpenStory,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isCreating, setIsCreating] = useState(false);
  const [activeSenderGroup, setActiveSenderGroup] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const senderGroups = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      const key = getSenderKey(q);
      if (!map.has(key)) {
        map.set(key, {
          senderKey: key,
          visitorId: q.visitorId,
          ipAddress: q.ipAddress,
          deviceSummary: q.deviceSummary || q.device,
          city: q.city,
          country: q.country,
          aliases: new Set(),
          contacts: new Set(),
          questions: [],
        });
      }
      const g = map.get(key);
      if (q.alias) g.aliases.add(q.alias);
      if (q.contact && !q.contact.startsWith("Ẩn danh")) g.contacts.add(q.contact);
      g.questions.push(q);
    });
    return map;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let list = [...questions];
    if (filter === "pending") list = list.filter((q) => q.status !== "answered");
    if (filter === "answered") list = list.filter((q) => q.status === "answered");
    if (filter === "private") list = list.filter((q) => q.keepPrivate);
    if (filter === "public") list = list.filter((q) => q.isPublic);
    if (filter === "multi") {
      list = list.filter((q) => {
        const g = senderGroups.get(getSenderKey(q));
        return g && g.questions.length > 1;
      });
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (q) =>
          q.question?.toLowerCase().includes(s) ||
          q.alias?.toLowerCase().includes(s) ||
          q.contact?.toLowerCase().includes(s) ||
          q.ipAddress?.includes(s) ||
          q.visitorId?.includes(s)
      );
    }
    return list;
  }, [questions, filter, search, senderGroups]);

  const handleSaveAnswer = async (item, text) => {
    if (!text.trim()) {
      showToast("⚠️ Vui lòng nhập câu trả lời!");
      return;
    }
    try {
      const isPub = item.isPublic !== false && !item.keepPrivate;
      await answerAnonymousQuestion({
        questionId: item.id,
        alias: item.alias,
        question: item.question,
        answer: text,
        isPublic: isPub,
      });
      showToast("✅ Đã lưu câu trả lời!");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    }
  };

  const handleTogglePublic = async (item, nextState) => {
    if (nextState && item.keepPrivate) {
      if (!window.confirm("⚠️ Khách chọn Riêng tư. Bạn chắc muốn công khai?")) return;
    }
    try {
      await toggleQuestionPublic(item.id, nextState, item);
      showToast(nextState ? "🌐 Đã công khai lên Wall!" : "🔒 Đã chuyển về riêng tư.");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteAnonymousQuestion(deleteCandidate.id);
      showToast("🗑️ Đã xóa câu hỏi.");
    } catch (err) {
      showToast("❌ Lỗi: " + err.message);
    } finally {
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="adm-questions-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2>
            <FontAwesomeIcon icon={faReply} style={{ marginRight: 8, color: "#ec4899" }} />
            Hộp thư Ẩn danh & Q&A Wall ({questions.length} tin)
          </h2>
          <p>Nhận diện cùng người gửi, quản lý trạng thái, công khai và phản hồi.</p>
        </div>

        <div className="adm-toolbar-controls">
          <input
            type="text"
            className="adm-search-input"
            placeholder="Tìm theo nội dung, tên, liên hệ, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="adm-btn-primary" onClick={() => setIsCreating(true)}>
            <FontAwesomeIcon icon={faPlus} /> Đăng Q&A / Thông báo
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="adm-filter-row" style={{ margin: 0 }}>
          <button type="button" className={`adm-filter-chip ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>
            Tất cả ({questions.length})
          </button>
          <button type="button" className={`adm-filter-chip ${filter === "pending" ? "is-active" : ""}`} onClick={() => setFilter("pending")}>
            ⏳ Chờ trả lời ({questions.filter((q) => q.status !== "answered").length})
          </button>
          <button type="button" className={`adm-filter-chip ${filter === "answered" ? "is-active" : ""}`} onClick={() => setFilter("answered")}>
            ✅ Đã trả lời ({questions.filter((q) => q.status === "answered").length})
          </button>
          <button type="button" className={`adm-filter-chip ${filter === "private" ? "is-active" : ""}`} onClick={() => setFilter("private")}>
            🔒 Riêng tư ({questions.filter((q) => q.keepPrivate).length})
          </button>
          <button type="button" className={`adm-filter-chip ${filter === "public" ? "is-active" : ""}`} onClick={() => setFilter("public")}>
            🌐 Đang công khai ({questions.filter((q) => q.isPublic).length})
          </button>
          <button type="button" className={`adm-filter-chip is-multi ${filter === "multi" ? "is-active" : ""}`} onClick={() => setFilter("multi")}>
            🔥 Cùng 1 người gửi
          </button>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className={`adm-btn-sec ${viewMode === "list" ? "is-active" : ""}`} onClick={() => setViewMode("list")}>
            <FontAwesomeIcon icon={faList} /> Danh sách
          </button>
          <button type="button" className={`adm-btn-sec ${viewMode === "threads" ? "is-active" : ""}`} onClick={() => setViewMode("threads")}>
            <FontAwesomeIcon icon={faComments} /> Theo người gửi
          </button>
        </div>
      </div>

      {viewMode === "threads" ? (
        <div className="adm-threads-grid">
          {Array.from(senderGroups.values()).map((g) => {
            const hasMultiple = g.questions.length > 1;
            const aliasList = Array.from(g.aliases);
            return (
              <div className="adm-thread-card" key={g.senderKey}>
                <div className="adm-thread-header" onClick={() => setActiveSenderGroup(g)}>
                  <div className="adm-thread-sender-info">
                    <div className="adm-thread-avatar">
                      {aliasList[0] ? aliasList[0].charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 16, color: "#fff" }}>
                          {aliasList.join(" / ") || "Ẩn danh"}
                        </strong>
                        {hasMultiple && (
                          <span className="adm-multi-sender-badge">
                            <FontAwesomeIcon icon={faFire} /> Đã gửi {g.questions.length} tin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {g.ipAddress ? `IP: ${g.ipAddress}` : "No IP"} • {g.deviceSummary || "Thiết bị không rõ"}
                      </div>
                    </div>
                  </div>
                  <button type="button" className="adm-btn-sec">
                    Xem chuỗi {g.questions.length} tin →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="adm-cards-grid">
          {filteredQuestions.length === 0 ? (
            <div className="adm-question-card" style={{ textAlign: "center", color: "#94a3b8" }}>
              Không tìm thấy tin nhắn nào phù hợp.
            </div>
          ) : (
            filteredQuestions.map((item) => {
              const key = getSenderKey(item);
              const group = senderGroups.get(key);
              return (
                <AdminQuestionCard
                  key={item.id}
                  item={item}
                  group={group}
                  senderKey={key}
                  note={senderNotes[key] || ""}
                  onSaveAnswer={handleSaveAnswer}
                  onTogglePublic={handleTogglePublic}
                  onDelete={setDeleteCandidate}
                  onOpenThread={setActiveSenderGroup}
                  onOpenStory={onOpenStory}
                />
              );
            })
          )}
        </div>
      )}

      {isCreating && (
        <AdminCreateQuestionModal onClose={() => setIsCreating(false)} showToast={showToast} />
      )}

      {activeSenderGroup && (
        <AdminSenderThreadModal
          senderGroup={activeSenderGroup}
          note={senderNotes[activeSenderGroup.senderKey] || ""}
          onClose={() => setActiveSenderGroup(null)}
          showToast={showToast}
          onOpenStory={onOpenStory}
        />
      )}

      {deleteCandidate && (
        <div className="adm-modal-backdrop" onClick={() => setDeleteCandidate(null)}>
          <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa câu hỏi này?</h3>
            <p>"{deleteCandidate.question}"</p>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn-sec" onClick={() => setDeleteCandidate(null)}>Hủy bỏ</button>
              <button type="button" className="adm-btn-primary" style={{ background: "#ef4444" }} onClick={handleConfirmDelete}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
