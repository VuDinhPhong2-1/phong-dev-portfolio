import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faChartLine,
  faClock,
  faDesktop,
  faEye,
  faGlobe,
  faListCheck,
  faMousePointer,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const countBy = (items, key, fallback = "Unknown") =>
  items.reduce((acc, item) => {
    const val = item[key] || fallback;
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

const toSortedEntries = (counts) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1]);

const formatTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const getEventColor = (type = "") => {
  if (type.includes("bubble") || type.includes("ngl")) return { bg: "rgba(236, 72, 153, 0.15)", text: "#f472b6", border: "rgba(236, 72, 153, 0.3)" };
  if (type.includes("cv") || type.includes("download")) return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
  if (type.includes("scroll")) return { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
  if (type.includes("copy")) return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
  if (type.includes("project") || type.includes("github")) return { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c", border: "rgba(249, 115, 22, 0.3)" };
  if (type.includes("view") || type.includes("dwell")) return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
  return { bg: "rgba(148, 163, 184, 0.15)", text: "#94a3b8", border: "rgba(148, 163, 184, 0.25)" };
};

export default function AdminAnalyticsTab({
  visitors = [],
  sessions = [],
  events = [],
}) {
  const referrers = useMemo(() => {
    const counts = {};
    sessions.forEach((s) => {
      let ref = s.referrer || "Direct";
      try {
        if (ref.startsWith("http")) ref = new URL(ref).hostname;
      } catch {}
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return toSortedEntries(counts).slice(0, 6);
  }, [sessions]);

  const devices = useMemo(
    () => toSortedEntries(countBy(visitors, "device")).slice(0, 6),
    [visitors]
  );

  const browsers = useMemo(
    () => toSortedEntries(countBy(visitors, "browser")).slice(0, 6),
    [visitors]
  );

  const interactionBreakdown = useMemo(() => {
    const actionCounts = {};
    events.forEach((e) => {
      if (e.type === "page_view") return;
      const label = e.actionLabel || e.type;
      actionCounts[label] = (actionCounts[label] || 0) + 1;
    });
    return toSortedEntries(actionCounts).slice(0, 8);
  }, [events]);

  const sectionViews = useMemo(() => {
    const counts = {};
    events
      .filter((e) => e.type === "section_view" && e.section)
      .forEach((e) => {
        counts[e.section] = (counts[e.section] || 0) + 1;
      });
    return toSortedEntries(counts);
  }, [events]);

  const scrollMilestones = useMemo(() => {
    const counts = { "25%": 0, "50%": 0, "75%": 0, "100%": 0 };
    events
      .filter((e) => e.type === "scroll_depth" && e.depth)
      .forEach((e) => {
        const key = `${e.depth}%`;
        if (counts[key] !== undefined) counts[key] += 1;
      });
    return Object.entries(counts);
  }, [events]);

  const recentEvents = useMemo(() => [...events].slice(0, 40), [events]);

  return (
    <div className="adm-analytics-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2>
            <FontAwesomeIcon icon={faChartLine} style={{ marginRight: 8, color: "#818cf8" }} />
            Thống kê Lưu lượng & Phân tích Truy cập
          </h2>
          <p>Dữ liệu tổng hợp từ các sự kiện lượt xem trang, thiết bị và nguồn giới thiệu.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="adm-question-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 13 }}>
            <FontAwesomeIcon icon={faEye} /> Tổng Lượt xem
          </div>
          <strong style={{ fontSize: 26, color: "#fff", marginTop: 6, display: "block" }}>
            {events.filter((e) => e.type === "page_view").length || sessions.length}
          </strong>
        </div>

        <div className="adm-question-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 13 }}>
            <FontAwesomeIcon icon={faUsers} /> Tổng Khách ghé thăm
          </div>
          <strong style={{ fontSize: 26, color: "#fff", marginTop: 6, display: "block" }}>
            {visitors.length || sessions.length}
          </strong>
        </div>

        <div className="adm-question-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 13 }}>
            <FontAwesomeIcon icon={faDesktop} /> Phiên hoạt động
          </div>
          <strong style={{ fontSize: 26, color: "#fff", marginTop: 6, display: "block" }}>
            {sessions.length}
          </strong>
        </div>

        <div className="adm-question-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 13 }}>
            <FontAwesomeIcon icon={faChartLine} /> Tổng Tương tác đã ghi
          </div>
          <strong style={{ fontSize: 26, color: "#38bdf8", marginTop: 6, display: "block" }}>
            {events.length}
          </strong>
        </div>
      </div>

      {/* Grid: Hành vi tương tác + Phễu cuộn + Mục được xem nhiều */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faMousePointer} style={{ color: "#38bdf8" }} />
            Hành vi tương tác hàng đầu
          </h3>
          {interactionBreakdown.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Chưa có sự kiện tương tác nào.</div>
          ) : (
            interactionBreakdown.map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
                <span style={{ color: "#e2e8f0" }}>{label}</span>
                <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>
                  {val} lượt
                </span>
              </div>
            ))
          )}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faListCheck} style={{ color: "#c084fc" }} />
            Phễu độ sâu cuộn trang
          </h3>
          {scrollMilestones.map(([milestone, count]) => (
            <div key={milestone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
              <span style={{ color: "#cbd5e1" }}>Đã cuộn đến {milestone}</span>
              <strong style={{ color: "#c084fc" }}>{count} lần</strong>
            </div>
          ))}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faEye} style={{ color: "#34d399" }} />
            Mục được xem nhiều nhất
          </h3>
          {sectionViews.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Chưa có lượt xem mục nào.</div>
          ) : (
            sectionViews.map(([section, val]) => (
              <div key={section} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
                <span style={{ color: "#cbd5e1", textTransform: "capitalize" }}>{section}</span>
                <strong style={{ color: "#34d399" }}>{val}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Recent Events Stream */}
      <div className="adm-question-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faBolt} style={{ color: "#fbbf24" }} />
            Nhật ký Hoạt động Trực tiếp (Live Activity Feed)
          </h3>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{recentEvents.length} hoạt động gần nhất</span>
        </div>

        {recentEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>
            Chưa có sự kiện nào được ghi nhận.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
            {recentEvents.map((e, idx) => {
              const color = getEventColor(e.type);
              const author = e.profileName || e.viewerLabel || (e.visitorId ? `#${String(e.visitorId).slice(-6)}` : "Khách");
              return (
                <div
                  key={e.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    background: "rgba(17, 24, 39, 0.6)",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: 13,
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
                    <span
                      style={{
                        background: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`,
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {e.actionLabel || e.type}
                    </span>

                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{author}</span>

                    {(e.operatingSystem || e.browser || e.city) && (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>
                        • {[e.operatingSystem, e.browser, e.city].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>

                  <span style={{ color: "#64748b", fontSize: 11, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />
                    {formatTime(e.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faGlobe} /> Nguồn truy cập (Referrers)
          </h3>
          {referrers.map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
              <span style={{ color: "#cbd5e1" }}>{label}</span>
              <strong style={{ color: "#a5b4fc" }}>{val}</strong>
            </div>
          ))}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faDesktop} /> Thiết bị sử dụng
          </h3>
          {devices.map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
              <span style={{ color: "#cbd5e1" }}>{label}</span>
              <strong style={{ color: "#a5b4fc" }}>{val}</strong>
            </div>
          ))}
        </div>

        <div className="adm-question-card">
          <h3 style={{ fontSize: 15, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            Trình duyệt phổ biến
          </h3>
          {browsers.map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
              <span style={{ color: "#cbd5e1" }}>{label}</span>
              <strong style={{ color: "#a5b4fc" }}>{val}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
