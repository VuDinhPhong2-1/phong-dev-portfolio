import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminTopbar({ currentTime, onSignOut }) {
  return (
    <header className="adm-topbar">
      <div className="adm-topbar-inner">
        <div className="adm-brand-block">
          <div className="adm-brand-logo">⚡</div>
          <div className="adm-brand-info">
            <h1>Vu Dinh Phong • ADMIN CONSOLE</h1>
            <div className="adm-brand-badges">
              <span className="adm-super-badge">SUPER ADMIN</span>
              <span className="adm-live-indicator">
                <span /> Realtime Sync
              </span>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                {currentTime.toLocaleTimeString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <div className="adm-topbar-actions">
          <a href="#/" className="adm-top-btn" title="Mở trang Portfolio">
            <FontAwesomeIcon icon={faGlobe} /> Portfolio
          </a>
          <a href="#/ngl" className="adm-top-btn" title="Mở trang NGL Wall">
            💌 NGL Wall
          </a>
          <button
            type="button"
            className="adm-top-btn adm-signout-btn"
            onClick={onSignOut}
            title="Đăng xuất"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
