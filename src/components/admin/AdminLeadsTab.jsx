import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faFire, faLocationDot, faNoteSticky, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getInterestLevel, INTEREST_LEVELS } from "../../services/analyticsTracker";
import { saveSenderAdminNote } from "../../services/questionService";

const toDate = (value) => {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
};

const formatDate = (value) => {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "Chưa rõ";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getLocation = (item = {}) =>
  [item.city, item.region || item.state, item.country].filter(Boolean).join(", ") || "Chưa rõ vị trí";

const LeadModal = ({ lead, events, sessions, note, onClose, onSaved, showToast }) => {
  const [draftNote, setDraftNote] = useState(note || "");
  const [saving, setSaving] = useState(false);
  if (!lead) return null;

  const leadEvents = events
    .filter((event) => event.visitorId === lead.visitorId)
    .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
  const leadSessions = sessions.filter((session) => session.visitorId === lead.visitorId);
  const level = INTEREST_LEVELS[getInterestLevel(lead.interestScore)];

  const saveNote = async () => {
    setSaving(true);
    try {
      await saveSenderAdminNote(`v_${lead.visitorId}`, draftNote);
      onSaved?.(draftNote);
      showToast?.("💾 Đã lưu ghi chú hồ sơ khách.");
    } catch (error) {
      showToast?.(`❌ Không thể lưu ghi chú: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal-box adm-lead-modal" onClick={(event) => event.stopPropagation()}>
        <div className="adm-lead-modal-header">
          <div>
            <span className={`adm-lead-level is-${getInterestLevel(lead.interestScore)}`}>
              {level.icon} {level.label}
            </span>
            <h3>{lead.profileName || lead.viewerLabel || `Khách #${String(lead.visitorId).slice(-6)}`}</h3>
            <p>{lead.visitorId}</p>
          </div>
          <button type="button" className="adm-btn-sec" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="adm-lead-summary-grid">
          <div><span>Điểm quan tâm</span><strong>{lead.interestScore || 0}</strong></div>
          <div><span>Số lần ghé</span><strong>{lead.visitCount || leadSessions.length || 1}</strong></div>
          <div><span>Vị trí gần đúng</span><strong>{getLocation(lead)}</strong></div>
          <div><span>Thiết bị</span><strong>{[lead.deviceModel, lead.operatingSystem, lead.browser].filter(Boolean).join(" • ") || "Chưa rõ"}</strong></div>
        </div>

        <div className="adm-lead-note">
          <FontAwesomeIcon icon={faNoteSticky} />
          <input
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Gắn nhãn hoặc ghi chú nội bộ: Nhà tuyển dụng, khách hàng..."
            maxLength={300}
          />
          <button type="button" className="adm-btn-primary" onClick={saveNote} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        <div className="adm-lead-timeline">
          <h4><FontAwesomeIcon icon={faClock} /> Dòng thời gian hành vi</h4>
          {leadEvents.length === 0 ? (
            <p>Chưa có sự kiện chi tiết trong cửa sổ dữ liệu hiện tại.</p>
          ) : leadEvents.map((event) => (
            <div className="adm-lead-timeline-item" key={event.id}>
              <time>{formatDate(event.createdAt)}</time>
              <div>
                <strong>{event.actionLabel || event.type}</strong>
                {event.scoreDelta > 0 && <span>+{event.scoreDelta} điểm</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AdminLeadsTab({ visitors = [], sessions = [], events = [], senderNotes = {}, showToast }) {
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [localNotes, setLocalNotes] = useState({});

  const leads = useMemo(() => visitors
    .map((visitor) => {
      const fallbackScore = events
        .filter((event) => event.visitorId === visitor.visitorId)
        .reduce((total, event) => total + (Number(event.scoreDelta) || 0), 0);
      return { ...visitor, interestScore: Number(visitor.interestScore) || fallbackScore };
    })
    .filter((visitor) => filter === "all" || getInterestLevel(visitor.interestScore) === filter)
    .sort((a, b) => b.interestScore - a.interestScore), [events, filter, visitors]);

  return (
    <div className="adm-leads-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2><FontAwesomeIcon icon={faFire} /> Khách quan tâm nhất</h2>
          <p>Xếp hạng theo tín hiệu tương tác. Vị trí là dữ liệu gần đúng từ hạ tầng mạng, không phải GPS.</p>
        </div>
        <div className="adm-lead-filters">
          {["all", "hot", "engaged", "casual"].map((value) => (
            <button
              key={value}
              type="button"
              className={`adm-btn-sec ${filter === value ? "is-active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "Tất cả" : `${INTEREST_LEVELS[value].icon} ${INTEREST_LEVELS[value].label}`}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-leads-list">
        {leads.length === 0 ? (
          <div className="adm-question-card adm-empty-state">Chưa có hồ sơ phù hợp bộ lọc.</div>
        ) : leads.map((lead, index) => {
          const levelKey = getInterestLevel(lead.interestScore);
          const level = INTEREST_LEVELS[levelKey];
          const noteKey = `v_${lead.visitorId}`;
          const note = localNotes[noteKey] ?? senderNotes[noteKey];
          return (
            <button className={`adm-lead-row is-${levelKey}`} key={lead.id || lead.visitorId} onClick={() => setSelectedLead(lead)}>
              <span className="adm-lead-rank">#{index + 1}</span>
              <span className="adm-lead-identity">
                <strong>{lead.profileName || lead.viewerLabel || `Khách #${String(lead.visitorId).slice(-6)}`}</strong>
                <small>{note || [lead.operatingSystem, lead.browser, lead.device].filter(Boolean).join(" • ") || "Khách ẩn danh"}</small>
              </span>
              <span className="adm-lead-location"><FontAwesomeIcon icon={faLocationDot} /> {getLocation(lead)}</span>
              <span className="adm-lead-visits">{lead.visitCount || 1} lần ghé</span>
              <span className={`adm-lead-score is-${levelKey}`}><b>{lead.interestScore}</b><small>{level.icon} {level.label}</small></span>
            </button>
          );
        })}
      </div>

      <LeadModal
        lead={selectedLead}
        events={events}
        sessions={sessions}
        note={selectedLead ? (localNotes[`v_${selectedLead.visitorId}`] ?? senderNotes[`v_${selectedLead.visitorId}`]) : ""}
        onClose={() => setSelectedLead(null)}
        onSaved={(value) => setLocalNotes((current) => ({ ...current, [`v_${selectedLead.visitorId}`]: value }))}
        showToast={showToast}
      />
    </div>
  );
}
