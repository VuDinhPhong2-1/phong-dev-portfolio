import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";

const hasCoordinates = (s) => typeof s.latitude === "number" && typeof s.longitude === "number";

const getGoogleMapsUrl = (s) => {
  if (!hasCoordinates(s)) return null;
  return `https://www.google.com/maps?q=${s.latitude},${s.longitude}`;
};

const getLocationText = (s) => {
  if (s.address) return s.address;
  const parts = [s.suburb, s.city, s.state, s.country].filter(Boolean);
  return parts.length ? parts.join(", ") : s.city || s.country || "Chưa rõ vị trí";
};

const getDisplayName = (s) => s.profileName || s.viewerLabel || "Khách ẩn danh";

const formatTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export default function AdminLiveDevicesTab({ sessions = [], activeSessions = [] }) {
  return (
    <div className="adm-live-devices-manager">
      <div className="adm-toolbar">
        <div className="adm-toolbar-title">
          <h2>
            <FontAwesomeIcon icon={faMicrochip} style={{ marginRight: 8, color: "#38bdf8" }} />
            Khách & Thiết bị Realtime ({activeSessions.length} đang online)
          </h2>
          <p>Theo dõi phần cứng thiết bị, cấu hình màn hình, kết nối mạng và vị trí GPS chính xác.</p>
        </div>
      </div>

      <div className="adm-devices-grid">
        {sessions.length === 0 ? (
          <div className="adm-question-card" style={{ gridColumn: "1 / -1", textAlign: "center", color: "#94a3b8" }}>
            Chưa có thông tin phiên truy cập nào được ghi nhận.
          </div>
        ) : (
          sessions.map((s) => {
            const isOnline = activeSessions.some((act) => act.id === s.id);
            const mapsUrl = getGoogleMapsUrl(s);
            return (
              <div className="adm-device-card" key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: isOnline ? "linear-gradient(135deg, #10b981, #06b6d4)" : "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {getDisplayName(s).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: "#fff", fontSize: 14 }}>{getDisplayName(s)}</strong>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {s.visitorId ? `ID: #${String(s.visitorId).slice(-6)}` : "Phiên mới"}
                      </div>
                    </div>
                  </div>

                  <span className={`adm-tab-pill ${isOnline ? "is-success" : ""}`}>
                    {isOnline ? "🟢 Online" : formatTime(s.lastSeenAt)}
                  </span>
                </div>

                {s.lastAction ? (
                  <div
                    style={{
                      margin: "12px 0 6px",
                      padding: "8px 12px",
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#e0e7ff" }}>
                      <span style={{ fontSize: 14 }}>⚡</span>
                      <strong>{s.lastAction}</strong>
                    </div>
                    {s.lastActionAt && (
                      <span style={{ fontSize: 11, color: "#a5b4fc" }}>
                        {formatTime(s.lastActionAt)}
                      </span>
                    )}
                  </div>
                ) : null}

                <dl>
                  <div>
                    <dt>Địa chỉ IP</dt>
                    <dd>{s.ipAddress || "Không rõ"}</dd>
                  </div>
                  <div>
                    <dt>Hệ điều hành</dt>
                    <dd>{s.operatingSystem || s.os || "Không rõ"}</dd>
                  </div>
                  <div>
                    <dt>Trình duyệt / Thiết bị</dt>
                    <dd>{s.browser || s.device || "Browser"}</dd>
                  </div>
                  <div>
                    <dt>CPU / RAM</dt>
                    <dd>
                      {s.hardwareConcurrency ? `${s.hardwareConcurrency} Cores` : "?"}
                      {s.deviceMemory ? ` • ${s.deviceMemory}GB` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Màn hình</dt>
                    <dd>{s.screen || s.viewport || "Chưa rõ"}</dd>
                  </div>
                  <div>
                    <dt>Cuộn sâu nhất</dt>
                    <dd style={{ color: s.maxScrollDepth >= 75 ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                      {s.maxScrollDepth ? `${s.maxScrollDepth}%` : "Chưa ghi nhận"}
                    </dd>
                  </div>
                  <div>
                    <dt>Múi giờ</dt>
                    <dd>{s.timezone || "Asia/Ho_Chi_Minh"}</dd>
                  </div>
                  <div>
                    <dt>Trang / Hash</dt>
                    <dd style={{ fontFamily: "monospace", fontSize: 12 }}>{s.hash || "/"}</dd>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <dt>
                      <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 4, color: "#f43f5e" }} />
                      Vị trí địa lý
                    </dt>
                    <dd>{getLocationText(s)}</dd>
                  </div>
                </dl>

                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-btn-sec"
                    style={{ textAlign: "center", justifyContent: "center" }}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Mở tọa độ Google Maps
                  </a>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
